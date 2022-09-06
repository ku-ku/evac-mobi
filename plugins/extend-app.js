import Vue from 'vue';
import Vuetify from 'vuetify';
import SkMsg from '~/components/SkMsg';

import 'vuetify/dist/vuetify.min.css';

import jQuery from 'jquery';
window["$"] = jQuery;

//TODO: import Worker from 'web-worker' (+see beforeCreate);

import { http as api, msg as ws, codec } from "~/utils/http";

export default async function( ctx ){
        
    const { app } = ctx;

    //ENV global
    ctx.store.commit("settings/set", {env: app.context.env});

    document.addEventListener('deviceready', function(){
        return true;
    });

    var appMsg = null,
        qaHellow = null;

    if (!app.mixins) {
        app.mixins = [];
    }

    app.mixins.push({
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
            
            var ws = null, sid = null;
            const _qa = async ()=>{
                try {
                    
                    if (!ws){
                        ws = await this.ws();
                        sid = ws.subscribe("PUBLIC.EVA.hellow");
                    }
                    
                    ( async ()=>{
                        try {
                            for await (const m of sid) {
                                const tm = (new Date()).getTime() - codec.decode(m.data).dt;
                                this.$store.commit("settings/set", {quality: (tm < 50) ? 1 : (tm < 200) ? 2 : 3 });
                            }
                        } catch(e){
                            console.log('ERR (ws)', e);
                            this.$store.commit("settings/set", {quality: -1})
                        }
                    })();
                    ws.publish("PUBLIC.EVA.hellow", codec.encode({dt: (new Date()).getTime()}));
                } catch(e) {
                    console.log('ERR (hellow)', e);
                }
            };  //_qa
            
            _qa();
            
            qaHellow = setInterval(_qa, 60*1000);
            
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
            }
        }       //methods
    });
};
