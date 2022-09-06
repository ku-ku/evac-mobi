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
    login: ({ commit, dispatch }, payload) => {
        const {u, p} = payload;
        const options = {
            type: 'auth',
            auth: 'Basic ' + btoa(u + ':' + p)
        };
        return new Promise((resolve, reject) => {
            $nuxt.api(options).then( r => {
                    if (!!r.result) {
                        commit('set', {subject: r.result});
                        resolve(r.result);
                    } else {
                        commit('set', {subject: r.result});
                        reject(r.error);
                    }
                }).catch( e => {
                    commit('set', {subject: null});
                    reject(e);
                });
        });
    },

    check: ({ dispatch }) => {
        const u = {
            u: 'ping',
            p: '' + (new Date()).getTime()
        };
        return dispatch("login", u);
    },
    
    logout({ commit }) {
        return new Promise( resolve => {
            $nuxt.api({
                type: 'logout'
            }).always(()=>{
                commit('set', {subject: null});
                document.cookie = 'JSESSIONID=;  Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
                resolve();
            });
        });
    }   //logout
    
};   //actions