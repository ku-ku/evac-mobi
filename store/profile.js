import { isEmpty } from "~/utils/";
import { sin2obj } from "~/store/data";

const _LS_TOKEN_KEY = "_sin2_at";


/**
 * Read additional info by user
 */
const _adds = async subject => {
    return new Promise((resolve,reject)=>{
        const opts = {
                        type: 'core-read',
                        query: `sin2:/v:f7dd439c-ca65-4109-94c6-301376431706/?filter=eq(field(".userId"),param("${ subject.id }","id"))`
                    };
        
        $nuxt.api(opts).then( res => {
            if ( 
                    ( res.result )
                 && ( res.result.data.length > 0 )
               ) {
               subject.region = sin2obj(res.result)[0];
               resolve();
            } else {
               reject({message: 'No user adds'}); 
            }
        }).catch( e => {
            reject(e);
        });
    });
}; //_adds


export const state = () => ({
    subject: null
});

export const mutations = {
    set(state, payload){
        Object.keys(payload).map( k => {
            if ("subject"===k){
                state.subject = payload[k];
            } else if (state.subject){
                state.subject[k] = payload[k];
            }
        });
    }
};  //mutations 

export const actions = {
    /**
     * Pre-auth by QR-code hash (payload) or token (from LS)
     * @param(payload): type String - hash for getting token
     */
    async preauth({ state, commit, dispatch }, payload){
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
                try {
                    at = state.subject?.tokens["access"];
                    if (!at){
                        at = JSON.parse(window.localStorage.getItem(_LS_TOKEN_KEY));
                    }
                } catch(e){
                    console.log('ERR (LS-at)', e);
                }
            }
            
            if ( !at ){
                reject({message: 'No access'});
            } else {
                try {
                    
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
                        
                        try {
                            await _adds(subject);
                        } catch(e){
                            console.log('ERR (adds)', e);
                        }
                        
                        commit('set', { subject });
                        resolve(subject);
                    } else {
                        throw r.error;
                    }
                } catch(e) {
                    console.log('ERR (preauth)', e);
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
            $nuxt.api(options).then( async r => {
                    if (!!r.result) {
                        const subject = r.result;
                        if (subject.tokens){
                            window.localStorage.setItem(_LS_TOKEN_KEY, JSON.stringify(subject.tokens["access"]));
                        }
                        
                        try {
                            await _adds(subject);
                        } catch(e){
                            console.log('ERR (adds)', e);
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
    region: state => state.subject?.region,
    token: state => {
        if (state.subject){
            return state.subject.tokens["access"]?.token;
        }
        return null;
    },
    is: state => q => {
        if (state.subject){
            switch(q){
                case "evac-role":
                    var res = false;
                    Object.keys(state.subject.roles).forEach( k => {
                        if ( /(эвакуатор)+/gi.test(state.subject.roles[k].title)){
                            res = true;
                        }
                    });
                    return res;
                case "evacuator":
                    return !!state.subject?.evacuator;
            }
        }
        return false;
    }
};
