<template>
    <vue-pull-refresh v-if="has('evacuator')" 
                      :on-refresh="reload" 
                      :config="pullRefreshConfig">
        <v-card class="eva-rq" tile>
        <v-card-title v-if="has('rq')" class="text-body-1 font-weight-light">
            Информация о задержании
        </v-card-title>    
        <v-card-text v-if="has('error')">
            <v-alert type="warning"
                     border="left"
                     colored-border>
                Ошибка получения данных<br />
                Информация для технической поддержки:
                <div class="text-muted">
                    {{ errm }}
                </div>
            </v-alert>
        </v-card-text>
        <v-card-text v-else-if="has('rq')">
            <v-list class="rq"
                    v-bind:class="stateClass"
                    dense>
                <v-list-item class="rq-status">
                    <div class="val">{{rq.status}}</div>
                </v-list-item>
                <v-list-item>
                    Заявка №
                    <div class="val">{{rq.regnum}}</div>
                </v-list-item>
                <v-list-item>
                    от
                    <div class="val">{{rq.at}}</div>
                </v-list-item>
                <v-list-item>
                    адрес нарушения
                    <div class="val">{{rq.offenseaddress}}</div>
                </v-list-item>
                <v-list-item>
                    марка/модель
                    <div class="val">{{rq.vehiclekindname}}</div>
                </v-list-item>
                <v-list-item>
                    гос.знак
                    <div class="val">{{rq.vehicleregnum}}</div>
                </v-list-item>
                <v-list-item>
                    стоянка
                    <div class="val">{{rq.parking}}</div>
                </v-list-item>
                <v-list-item>
                    ожидаемое время прибытия на стоянку
                    <div class="val">{{rq.arrivaltime}}</div>
                </v-list-item>
                <!--v-list-item>
                    {{ rq.id }}
                </v-list-item-->
            </v-list>
        </v-card-text>
        <v-card-text v-else>
            <v-alert type="info"
                     border="left"
                     colored-border>
                Нет активных заявок
            </v-alert>
        </v-card-text>
        <v-card-actions v-if="has('rq-new')"
                        class="justify-center pa-5">
            <v-btn color="primary"
                   tile
                   :loading="mode === MODES.saving"
                   v-on:click="doit">
                подтвердить
            </v-btn>
        </v-card-actions>
    </v-card>
    </vue-pull-refresh>
    <div v-else class="eva-vehicle">
        <v-form v-on:submit.stop.prevent="usevehicle">
            <v-text-field
                label="гос.знак"
                clearable
                autofocus
                style="max-width:12rem;margin:0 auto"
                :messages="['введите гос.знак эвакуатора, например: к345хе123']"
                :error="has('error')"
                :error-messages="errm"
                :success="has('evacuator')"
                v-model="gov"></v-text-field>
            <v-btn color="primary" tile
                   class="my-5"
                   type="submit"
                   :loading="mode === MODES.loading">
                <v-icon small>mdi-tow-truck</v-icon>&nbsp;выбрать
            </v-btn>
        </v-form>
        <eva-gov-list ref="EvaGovList" v-on:go ="uselocal"/>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import VuePullRefresh from 'vue-pull-refresh';
import { isEmpty, MODES } from "~/utils";
import { sin2obj } from "~/store/data";
const $moment = require("moment");
$moment.locale('ru');
const now = $moment().format("DD.MM.YYYY");
const PAGE_SIZE = 20;

const _VIEW_ID = "8190818d-bf31-41d3-8e3c-08582b85f7e9";
const _VIEW_URI= `sin2:/v:${ _VIEW_ID }`;

const pullRefreshConfig = {
    errorLabel: '',
    startLabel: '',
    readyLabel: 'обновить',
    loadingLabel: 'загрузка...',
    pullDownHeight: 100
};

export default {
    name: 'EvaEvaRq',
    data(){
        return {
            MODES,
            mode: MODES.default,
            pullRefreshConfig,
            gov: null,
            rq: null,
            error: null
        };
    },
    components: {
        VuePullRefresh
    },
    mounted(){
        this.gov = this.$store.state.settings.saved?.evaGovNum;
    },
    
    async fetch(){
        try {
            await this.$store.dispatch("data/read", "statuses");
            await this.$store.dispatch("data/read", "parkings");
        } catch(e){
            console.log('ERR (data/read)', e);
        }
    },
    computed: {
        errm(){
            if (this.error){
                var s = this.error.message;
                if (this.error.data){
                    s += ' ' + this.error.data;
                }
                return s;
            }
            return '';
            
        },
        evacuator(){
            return this.$store.state.profile.subject?.evacuator || {};
        },
        stateClass(){
            const status = this.rq?.status || 'xxx';
            if ( this.has('rq-new') ){
                return "rq-new";
            } else if (/(работ)+/gi.test(status)){
                return "rq-work";
            } else if (/(стоян)+/gi.test(status)||/(выда)+/gi.test(status)){
                return "rq-disable";
            }
        },
        title(){
            return this.has('rq') ? `Заявка № ${this.rq.regnum}` : this.evacuator.govnum || '';
        },
        ...mapState({
            statuses: state => state.data.statuses,
            parkings: state => state.data.parkings
        })
    },
    methods: {
        has(q){
            switch(q){
                case 'error':
                    return !!this.error;
                case 'evacuator':
                    return this.$store.getters["profile/is"]("evacuator");
                case 'rq':
                    return !!this.rq;
                case 'rq-new':
                    return /(нова)+/gi.test(this.rq?.status)||/(назнач)+/gi.test(this.rq?.status);
            }
            return false;
        },
        async usevehicle(e){
            this.error = null;
            try {
                if (isEmpty(this.gov)||this.gov.length < 4){
                    throw {message: 'Введите корректный гос.знак эвакуатора'};
                }
                this.mode = MODES.loading;
                const reGov = new RegExp(`^(${ this.gov })+`, 'gi');
                await this.$store.dispatch("data/read", "evacs");
                const evacs = this.$store.state.data.evacs;
                const n = evacs.findIndex( e => reGov.test(e.govnum));
                if ( n < 0 ){
                    throw {message: `Гос.знак "${ this.gov }" не найден в списке эвакуаторов`};
                }
                this.$store.commit("profile/set", {evacuator: evacs[n]});
                this.$store.commit("settings/setSaved", {evaGovNum: evacs[n].govnum});
                this.$refs["EvaGovList"].save(evacs[n]); 
                
                setTimeout(()=>{
                    $nuxt.$children.forEach( c => c.$forceUpdate() ); //TODO: in other page
                    this.getrq();
                }, 300);
            } catch(e){
                console.log('ERR usevehicle', e);
                this.error = e;
                this.$nextTick(()=>{ $(this.$el).find("input").focus(); });
                
            } finally {
                this.mode = MODES.default;
            }
            
            return false;
        },  //usevehicle
        async uselocal(gov){
            this.error = null;
            try {
                await this.$store.dispatch("data/read", "evacs");
                const evacs = this.$store.state.data.evacs;
                const n = evacs.findIndex( e => reGov.test(e.govnum));
                if ( n < 0 ){
                    throw {message: `Гос.знак "${ this.gov }" не найден в списке эвакуаторов`};
                }
                this.$store.commit("profile/set", {evacuator: evacs[n]});
                this.$store.commit("settings/setSaved", {evaGovNum: evacs[n].govnum});
                this.$refs["EvaGovList"].save(evacs[n]);
                
                setTimeout(()=>{
                    $nuxt.$children.forEach( c => c.$forceUpdate() );   //TODO: in other page
                    this.getrq();
                }, 300);

            } catch(e) {
                
            }
        },
        _normalize(rq){
            rq.at = $moment(rq.createdt).format('DD.MM.YYYY HH:mm');
            var n = this.statuses?.findIndex( s => rq.stateid === s.id );
            rq.status = ( n > -1) ? this.statuses[n].name : '';
            
            n = this.parkings?.findIndex( p => rq.parkingid === p.id );
            rq.parking = ( n > -1) ? this.parkings[n].name : '';
            this.rq = rq;
            console.log('RQ', this.rq);
            this.$forceUpdate();
        },
        
        /**
         * Checking RQ by Id (evac only) & readind when it
         */
        async userq(id){
            try {
                const opts = {
                    type: 'core-read',
                    query: _VIEW_URI + `?id=${ id }&fields=.id,.vehicleEvacID`
                };
                const res = await $nuxt.api(opts);
                if (!!res.error){
                    throw res.error;
                } else if ( res.result.data.length > 0 ){
                    const rq = sin2obj( res.result )[0];
                    if (rq.vehicleevacid === this.evacuator.id){
                        this.getrq(id);
                    }
                } else {
                    console.log('No data(userq)', id);
                }
            } catch(e){
                console.log('ERR (userq)', e);
            }
        },
        
        /**
         * Full read RQ info
         */
        async getrq(id){
            try {
                const evacuator = this.$store.state.profile.subject?.evacuator;
                
                const opts = {
                    type: 'core-read',
                    query: _VIEW_URI + `?filter=and(
                                                        exists(\"a5603bce-4795-432b-b2c3-ce9323773015\", \"and(eq(super.field(\\\".stateId\\\"),field(\\\".id\\\")),eq(field(\\\".active\\\"),param(true,\\\"boolean\\\")))\"),
                                                        eq(field(".vehicleEvacId"),param("${ evacuator?.id }", "id"))
                                                )&sort=-evacOffenseJournal.regNum`
                },
                byIdAttr = (typeof id !== "undefined");
                
                if (byIdAttr){
                    opts.query = _VIEW_URI + `?id=${ id }`;
                }
                const res = await $nuxt.api(opts);
                if (!!res.error){
                    throw res.error;
                } else if ( res.result.data.length > 0 ){
                    
                    this._normalize( sin2obj(res.result)[0] );
                    
                    if ( byIdAttr && this.has('rq-new') ) {
                        if ( !Notification.requestPermission(res => {
                            if (res === 'granted') {
                                navigator.serviceWorker.ready.then( registration => {
                                    registration.showNotification("Поступила заявка", {
                                        requireInteraction: true,
                                        tag: "eva-notify",
                                        body: `№ ${this.rq.regnum} ${this.rq.at}: ${this.rq.offenseaddress}`,
                                        icon: require('@/assets/eva-notify.png'),
                                        image:require('@/assets/eva-notify.png'),
                                        vibrate: [300, 100, 400],
                                        renotify: true
                                    });
                                    window.focus();
                                });
                                const audio = new Audio("/meloboom.mp3");
                                audio.play();
                            } else {
                                $nuxt.msg({text:"Необходимо разрешить уведомления", type: "warning", timeout: 20000 });
                            }
                        })) {
                            $nuxt.msg({text:"Необходимо разрешить уведомления", color: "warning", timeout: 20000});
                        }
                    }   //if ( byIdAttr && ...
                } else {
                    this.rq = null;
                }
            } catch(e){
                console.log('ERR (last)', e);
                this.error = e;
            }
        },   //getrq
        
        /**
         * Change state "in work"
         */
        async doit(){
            const STATE_ID = "cde69648-17ed-4403-98a3-be504ade5089"; /* в работе*/
            this.mode = MODES.saving;
            try {
                const opts = {
                    type: 'core-update',
                    query: _VIEW_URI + `?id=${this.rq.id}`,
                    params: [
                                {id: 'id',      type: 'id',  value: this.rq.id},
                                {id: 'stateid', type: 'id',  value: STATE_ID}
                    ]
               };
            
                const res = await $nuxt.api(opts);
                if (res.result){
                    this.mode = MODES.default;
                } else {
                    throw res.error;
                }
                
                this.rq.stateid = STATE_ID;
                this._normalize(this.rq);
               
           } catch(e){
               console.log('ERR (doit)', e);
           }
            
        },   //doit
        
        changeVc(){
            this.$store.commit("profile/set", {evacuator: null});
            this.$forceUpdate();
        },
        
        reload(){
            this.getrq(this.rq?.id);
        }
    }
}    
</script>
<style lang="scss">
    body {
      overscroll-behavior: contain;
    }    
    .pull-down-header{
        background-color: #607D8B !important;
    }
</style>    
<style lang="scss" scoped>
    .eva-rq{
        & .v-card__title{
            flex-flow: column;
        }
        & .text-muted{
            font-size: 0.85rem;
        }
        & .rq{
            & .v-list-item{
                justify-content: space-between;
                text-align: left;
                line-height: 1.125;
                margin-bottom: 0.25rem;
                &:not(:first-child){
                    border-top: 1px solid #ccc;
                }
                & .val{
                    text-align: right;
                    margin-left: auto;
                }
            }
            & .rq-status{
                justify-content: flex-end;
                padding-right: 0;
                & .val{
                    font-size: 1.15rem;
                    text-transform: uppercase;
                    padding: 0.5rem;
                    border-radius: 4px;
                }
            }
            &.rq-new {
                & .rq-status .val {
                    background-color: #FF9800; /*orange*/
                    color: #fff;
                }
            }
            &.rq-work{
                & .rq-status .val {
                    background-color: #009688; /*teal*/
                    color: #fff;
                }
            }
            &.rq-disable{
                & .rq-status .val {
                    background-color: #CFD8DC; /*blue-grey*/
                    color: #fff;
                }
            }
        }
    }
</style>