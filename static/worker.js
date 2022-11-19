//globalThis.WebSocket = self.importScripts("../node_modules/websocket").w3cwebsocket;
//console.log(importScripts('../node_modules/nats.ws/lib/src/mod.js'));
//const { connect, JSONCodec } = require('../node_modules/nats.ws/lib/src/mod.js');

var env,
    nats;


addEventListener('message', e => {
    console.log('message', e);
    switch (e.data?.type){
        case "init":
            env = e.data;
            init();
            break;
    }
});

const init = async ()=>{
    
/**    
    
    try {
        nats = await connect(env.natsWs);
    } catch(e){
        console.log('ERR (nats-connect)', e);
    }
    Notification.requestPermission(res => {
        if (res === 'granted') {
            navigator.serviceWorker.ready.then(function(registration) {
                // теперь мы можем показать уведомление
                return registration.showNotification(payload.notification.title, payload.notification);
            }).catch(function(error) {
                console.log('ServiceWorker registration failed', error);
            });
        }
    });
* 
*/
};