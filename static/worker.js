//globalThis.WebSocket = importScripts("websocket").w3cwebsocket;
//console.log(importScripts('../node_modules/nats.ws/lib/src/mod.js'));
//const { connect, JSONCodec } = require('../node_modules/nats.ws/lib/src/mod.js');

var env,
    nats;


addEventListener('message', e => {
    console.log('message', e);
    switch (e.type){
        case "init":
            env = e.data;
            init();
            break;
    }
});

const init = ()=>{
    
};