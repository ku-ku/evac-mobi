import { isEmpty } from "~/utils/";

const _LS_TOKEN_KEY = "_sin2_at";

export const state = () => ({
    subject: null
});

export const mutations = {
    set(state, payload){
        Object.keys(payload).map( k => {
            state[k] = payload[k];
        });
    }
};  //mutations 

export const actions = {
    /**
     * @param(payload): type String - hash for getting token
     */
    async preauth({ state, commit }, payload){
        return new Promise(async (resolve, reject) => {
            
            var at = null;
            
            
            if ( !isEmpty(payload) ){
                try {
                    document.cookie = 'JSESSIONID=;  Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
                    at = {
                        token: await $nuxt.api({
                                                    type: 'pre-auth',
                                                    mark: payload
                                               })
                    };
                    console.log('at by mark', at);
                } catch(e){
                    reject(e);
                    return;
                }
            } else {
                at = state.subject?.tokens["access"];
                if (!at){
                    at = window.localStorage.getItem(_LS_TOKEN_KEY);
                }
            }
            
            if ( !at ){
                reject({message: 'No access'});
            } else {
                try {
                    if (typeof at === "string"){
                        at = JSON.parse(at);
                    }
                    
                    document.cookie = 'JSESSIONID=;  Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
                    
                    const options = {
                        type: 'auth',
                        auth: `Bearer ${at.token}`
                    };
                    
                    const r = await $nuxt.api(options);
                    
                    if (!!r.result) {
                        const subject = r.result;
                        
                        if (!subject.tokens){
                            subject.tokens = {};
                        }
                        subject.tokens["access"] = at;
                        
                        commit('set', { subject });
                        resolve(subject);
                    } else {
                        throw r.error;
                    }
                } catch(e) {
                    commit('set', {subject: null});
                    reject(e);
                }
            }
        });
    },  //preauth
    
    async login({ commit, dispatch }, payload){
        const {u, p} = payload;
        const options = {
            type: 'auth',
            auth: 'Basic ' + btoa(u + ':' + p)
        };
        return new Promise((resolve, reject) => {
            $nuxt.api(options).then( r => {
                    if (!!r.result) {
                        const subject = r.result;
                        if (subject.tokens){
                            window.localStorage.setItem(_LS_TOKEN_KEY, JSON.stringify(subject.tokens["access"]));
                        }
                        commit('set', { subject });
                        resolve(subject);
                    } else {
                        commit('set', {subject: null});
                        reject(r.error);
                    }
                }).catch( e => {
                    commit('set', {subject: null});
                    reject(e);
                });
        });
    },

    async logout({ commit }) {
        return new Promise( resolve => {
            $nuxt.api({
                type: 'logout'
            }).always(()=>{
                commit('set', {subject: null});
                document.cookie = 'JSESSIONID=;  Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
                window.localStorage.removeItem(_LS_TOKEN_KEY);
                resolve();
            });
        });
    }   //logout
    
};   //actions


export const getters = {
    tenant: state => {
        if (state.subject){
            return state.subject.tenants[state.subject.tenantId]?.title;
        }
        return null;
    },
    token: state => {
        if (state.subject){
            return state.subject.tokens["access"]?.token;
        }
        return null;
    }
};
