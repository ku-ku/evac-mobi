import Vue from 'vue';
import Vuetify from 'vuetify';
import SkMsg from '~/components/SkMsg';

import 'vuetify/dist/vuetify.min.css';

import jQuery from 'jquery';
window["$"] = jQuery;

//TODO: import Worker from 'web-worker' (+see beforeCreate);

import { isEmpty } from "~/utils";
import { http as api, msg as ws, codec } from "~/utils/http";

export default async function( ctx ){
        
    const { app } = ctx;
    const { env } = app.context;
    
    //ENV global
    ctx.store.commit("settings/set", {env: app.context.env});

    document.addEventListener('deviceready', function(){
        return true;
    });

    var appMsg = null,
        qaHellow = null,
        _ws = null, sid = null; //websock sub (see wspooling)

    if (!app.mixins) {
        app.mixins = [];
    }

    app.mixins.push({
        computed: {
            subject(){
                return this.$store.state.profile.subject;
            }
        },
        beforeCreate(){
/*TODO:            
            const worker = new Worker('/worker.js');
            worker.addEventListener('message', e => {
                console.log(e.data)  
            });
            worker.postMessage({type:'init', env: app.context.env});
* 
*/
        },
        
        mounted(){
            (async ()=>{
                try {
                    await this.$store.dispatch("branding/read");
                    await this.$store.dispatch("geo/current");
                } catch(e){
                    console.log('ERR (geo)', e);
                }
            })();
        },
        beforeDestroy(){
            if (!!qaHellow){
                clearInterval(qaHellow);
            }
        },
        methods: {
            api,
            ws,
            msg(msg){
                if (!(!!appMsg)){
                    const el = $('<div id="app-msg"></div>').appendTo($(this.$el).find('.v-application'));
                    const c = new Vue({
                                functional: true,
                                el: el.get(0),
                                vuetify: new Vuetify(this.$vuetify.theme.themes),
                                components: { SkMsg },
                                render(h){return h(SkMsg, {ref:"app-msg"});}
                            });
                    appMsg = c.$refs["app-msg"];
                }
                return appMsg.show(msg);
            },
            bepooling(){
                const SUB_KEY = `PUBLIC.EVA.hellow-${ this.subject?.id || 'unknown' }`,
                      store   = this.$store;
                const _set_qa = ( tm ) => {
                    if (tm < 0){
                        store.commit("settings/set", {quality: -1});
                    } else {
                        store.commit("settings/set", {quality: (tm < 50) ? 1 : (tm < 200) ? 2 : 3 });
                    }
                };
                
                //TODO: avg for test's
                //ws-pool
                ( async ()=>{
                    if (!_ws){
                        _ws = await this.ws();
                        sid = _ws.subscribe(SUB_KEY);
                    }

                    try {
                        for await (const m of sid) {
                            const tm = (new Date()).getTime() - codec.decode(m.data).dt;
                            _set_qa(tm);
                        }
                    } catch(e){
                        console.log('ERR (ws)', e);
                        _set_qa(-1);
                    }
                    
                    _ws.publish(SUB_KEY, codec.encode({dt: (new Date()).getTime()}));
                })();
                    
                //rpc-pool
                ( async ()=>{
                    var tm = (new Date()).getTime();
                    $.ajax({
                        url: `${ env.rpcUrl }?d=ping`,
                        type: "POST",
                        timeout: 1000,
                        processData: false,
                        cache: false,
                        success: (resp, status) => {
                            tm = (new Date()).getTime() - tm;
                            _set_qa(tm);
                        },
                        error: (e, status) => {
                            console.log('ERR (rpc)', e, status);
                            _set_qa(-1);
                        }
                    });
                    
                })();
                
                if (!qaHellow){
                    qaHellow = setInterval(this.bepooling, 60*1000);
                }
            },
        },       //methods
        watch: {
            "subject.id"(val){
                console.log("subject changed", val);
                if ( !isEmpty(val) ){
                    this.bepooling();
                }
            }
        }
    });
};
