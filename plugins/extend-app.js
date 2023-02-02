import Vue from 'vue';
import Vuetify from 'vuetify';
import SkMsg from '~/components/SkMsg';

import 'vuetify/dist/vuetify.min.css';

import jQuery from 'jquery';
window["$"] = jQuery;

import { isEmpty } from "~/utils";
import { http as api, msg as ws, codec } from "~/utils/http";

export default async function( ctx ){
        
    console.log('APP (start)', ctx);
    const { app } = ctx;
    const { env } = app.context;
    
    //ENV global
    ctx.store.commit("settings/set", {env: app.context.env});

    document.addEventListener('deviceready', function(){
        return true;
    });

    var appMsg = null,
        _ws = null, sid = null; //websock sub (see wspooling)

    var _swr = null;            //service-worker register

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
            navigator.serviceWorker.register('/worker.js').then(reg => {
                _swr = reg;
                /* TODO:
                    const subsOpts = {
                        userVisibleOnly: true,
                        //applicationServerKey: btoa('BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U')
                    };
                    return reg.pushManager.subscribe(subsOpts);
                */
            }).then( pushSubscription => {
                console.log('PushSubscription: ', JSON.stringify(pushSubscription));
                return pushSubscription;
            });
            
            navigator.serviceWorker.onmessage = e => {
                if ('_be_pooling'===e.data?.type){
                    this._set_qa(e.data.time);
                }
            };
            
        },
        created(){
            this.$store.commit("settings/readSaved");
            this.$store.dispatch("geo/current");
        },
        mounted(){
            const { query } = ctx;
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
            this.swmsg({type: "stop"});
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
            /**
             * Service-worker post message
             */
            swmsg(msg){
                navigator.serviceWorker?.controller?.postMessage(msg);
            },
            _set_qa(tm) {
                if (tm < 0){
                    this.$store?.commit("settings/set", {quality: -1});
                } else {
                    this.$store?.commit("settings/set", {quality: (tm < 50) ? 1 : (tm < 200) ? 2 : 3 });
                }
            }
        },       //methods
        watch: {
            "subject.id"(val){
                if ( !isEmpty(val) ){
                    this.swmsg({type:"init", env});
                }
            }
        }
    });
};
