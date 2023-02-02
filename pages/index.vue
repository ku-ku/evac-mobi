<template>
  <v-row class="mt-5">
      <v-col v-if="$store.getters['profile/is']('evac-role')"
             cols="12" align="center" justify="center">
            <eva-eva-rq ref="evarq" />
      </v-col>    
      <v-col v-else
             cols="12" align="center" justify="center">
            <v-btn tile
                   color="primary"
                   :to="{name:'arrest-id', params:{id:null}}">
                ОФОРМИТЬ ЗАДЕРЖАНИЕ&nbsp;<v-icon>mdi-car-side</v-icon>
            </v-btn>
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn tile
                           color="primary"
                           v-on="on"
                           v-on:click="$nuxt.refresh()">
                        <v-icon>mdi-reload</v-icon>
                    </v-btn>
                </template>
                <span>обновить список</span>
            </v-tooltip>
            <v-row>
                <v-col cols="12">
                  <eva-transport-list ref="transportList" />
                </v-col>
            </v-row>
      </v-col>
  </v-row>
</template>

<script>
import EvaTransportList from "~/components/EvaTransportList";
import EvaEvaRq from "~/components/EvaEvaRq";
import { isEmpty } from "~/utils";
import { codec } from "~/utils/http";

var ws = null, sid = null;

export default {
    middleware: 'auth',
    name: 'IndexPage',
    components: {
        EvaTransportList,
        EvaEvaRq
    },
    head(){
        return {
                    title: `Эвакуация: ${ (this.$refs["evarq"]) ? (this.$refs["evarq"]).title || '' : this.$refs["transportList"]?.tilte }`
               };
    },
    created(){
        const self = this;
        Notification.requestPermission(res => {
            if (res === 'granted') {
            } else {
                $nuxt.msg({text:"Необходимо разрешить уведомления", color: "warning"});
            }
        });
        
        (async ()=>{
            try {
                if (!ws){
                    ws = await $nuxt.ws();
                    sid = ws.subscribe('PUBLIC.EVA.status');
                    try {
                        for await (const m of sid) {
                            self.notify.call(self, codec.decode(m.data));
                        }
                    } catch(e){
                        console.log('ERR (ws-status)', e);
                    }
                }
            } catch(e){
                console.log('ERR (ws)', e);
            }
        })();
    },
    activated(){
        const id = this.$route.params?.id;
        if ( !isEmpty(id) ){
            this.notify({id});
        }
    },
    methods: {
        notify({ id }){
            console.log('notify->RQ', id);
            const myrq = (this.$refs["evarq"]) ? this.$refs["evarq"].userq(id) : this.$refs["transportList"]?.highlight2(id);
        }
    }
}
</script>
