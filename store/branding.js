export const state = ()=>({
    branding: {},
    loaded: false
});

export const mutations = {
    set(state, branding) {
        state.branding = branding;
        state.loaded = true;
    }
};

export const actions = {
    read({ commit, state }) {
        return new Promise( resolve => {
            if (!!state.loaded){
                resolve();
                return;
            }
            
            $nuxt.api({
                    url: 'branding?type=json',
                    type: 'api-call',
                    dataType: 'text',
                    processData: false
            }).then( res => {
                    var b;
                    eval(`b=${ res }`);
                    commit('set', b);
                    resolve();
            }).catch(e => {
                console.log('ERR (branding read):', e);
                resolve();  //TODO
            });
        });
    }
};

export const getters = {
    get: state => name => {
        return (!!state.loaded) ? state.branding[name] || '' : '';
    }
};
