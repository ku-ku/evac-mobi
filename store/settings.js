const _LS_SETTS_KEY = '_eva_setts';

var PushController;

export const state = () => ({
    notifi: {
        fcmId: undefined
    },
    env: undefined,
    quality: -1,
    saved: {}
});

export const mutations = {
    set(state, payload){
        Object.keys(payload).map( k => {
            state[k] = payload[k];
        });
    },
    setPush(state, payload) {
      const {fcmId, value} = payload;
      state.notifi.fcmId = fcmId;
    },
    readSaved(state){
        try {
            const s = window.localStorage.getItem(_LS_SETTS_KEY);
            if ( (s) && /^\{+/.test(s) ){
                state.saved = JSON.parse(s);
            }
        } catch(e){
            console.log('ERR (ls-read saved)', e);
        }
    },
    setSaved(state, payload) {
        const stt = state.saved || {};
        Object.keys(payload).forEach( k => {
            stt[k] = payload[k];
        });
        state.saved = stt;
        window.localStorage.setItem(_LS_SETTS_KEY, JSON.stringify(stt));
    }   //setSaved
};  //mutations 

export const actions = {
    async initPushes({getters, commit}){
        const senderId = getters["env"]("pushSndId");
        
        const _p = (resolve, reject) => {
            if (typeof window.PushNotification === 'undefined') {
                reject({error:'No push`s available'});
            } else {
                const opts = {
                    android: {
                        senderID: senderId,
                        forceShow: 'true'
                    },
                    ios: {
                        senderID: senderId,
                        gcmSandbox: 'false',
                        alert: 'true',
                        badge: 'true',
                        sound: 'true'
                    }
                };
                PushController = window.PushNotification.init(opts);
                PushController.on('notification', (data)=>{
                    console.log('PUSH.onNotification', data);
                });
                PushController.on('error', (err)=>{
                    console.log('PUSH.onError', err);
                });
                PushController.on('registration', (data)=>{
                    const {registrationId} = data;
                    commit('setPush', {
                      fcmId: registrationId,
                      value: true
                    });
                    resolve(registrationId);
                });
            }
        };
        
        return new Promise(_p);
    },   //initPushes
    
    destroy({commit}) {
        if (!!PushController) {
            PushController.unregister(function(){
                commit('setPush', {
                    fcmId: undefined,
                    value: false
                });
            }, function(err){
                console.log('PUSH.onUnregisterError', err);
            });
        }
    }
};

export const getters = {
    env: state => q =>{
        return (!!q) ? state.env[q] : state.env;
    },
    get: state => q =>{
        var res = state.env[q];
        return res;        
    }
};