let env,
    nats;
    
//pool-timer    
let hqaInt = false;


addEventListener('message', e => {
    console.log('message', e);
    switch (e.data?.type){
        case "init":
            env = e.data.env;
            nats= e.data.nats;
            init();
            break;
        case "stop":
            stop();
            break;
        case "notify":
            notify(e.data);
            break;
    }
}); //message

/**
 * Back-end pooling quality
 * @returns {undefined}
 */
const _be_pooling = async() => {
    var tm = (new Date()).getTime();
    try {
        const resp = await fetch(`${ env.rpcUrl }?d=ping`, {
                                type: "POST",
                                timeout: 1000,
                                cache: 'no-cache'
                            });
        tm = (new Date()).getTime() - tm;
    } catch(e){
        tm = -1;
        console.log('ERR-SW (rpc)', e);
    } finally {
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then( clients => {
            if (clients?.length > 0) {
                clients[0].postMessage({
                    type: '_be_pooling',
                    time: tm,
                });
            }
        });
    }
};  //_be_pooling


function init(){
    if (!hqaInt){
        hqaInt = setInterval(_be_pooling, 5*60*1000);
    }
    _be_pooling();
};      //init


function notify({ws, codec, id}){
    
}


function stop(){
    if (hqaInt){
        clearInterval(hqaInt);
    }
}
