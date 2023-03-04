<template>
    <div>
        <v-form v-on:submit.stop.prevent="save"
                ref="form"
                :readonly="readonly">
            <v-card class="ev-arrest"
                    tile>
                <v-toolbar dark
                           elevation="0"
                           :color="handInput ? 'blue-grey' : 'primary'"
                           v-on:click.stop.prevent="get('addr')"
                           height="auto"
                           class="py-2">
                        <v-icon class="mr-2">{{has('new') ? 'mdi-plus' : 'mdi-application-edit-outline'}}</v-icon>
                        <div>
                            {{ address }}
                            <div class="coords">
                                {{ coords }}
                            </div>
                        </div>
                        <v-icon>{{ has('fine') ? 'mdi-map-marker' : 'mdi-map-marker-alert'}}</v-icon>
                </v-toolbar>
                <v-card-text>
                    <v-row class="text-subtitle-1">
                        <v-col>Информация о задержании&nbsp;<v-icon>mdi-chevron-down</v-icon></v-col>
                    </v-row>
                    <v-row v-if="handInput" class="hand-address">
                        <v-col cols="12">
                            <v-text-field label="Адрес места нарушения"
                                          v-model="row.offenseaddress"
                                          clearable
                                          name="offenseaddress"
                                          :messages="coords"
                                          :error="has('addr-err')"
                                          v-on:click:clear="set('addr', '')">
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" class="text-center">
                            <v-btn tile
                                   outlined
                                   color="blue-grey"
                                   v-on:click="lookup">
                                определить координаты
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Дата, время оформления"
                                          v-model="at"
                                          hide-details
                                          readonly>
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-autocomplete label="Статус"
                                        item-text="name"
                                        item-value="id"
                                        hide-details
                                        eager
                                        :return-object="false"
                                        :items="statuses"
                                        :rules="[ rules.empty ]" 
                                        v-model="row.stateid">
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-autocomplete label="Район/МО"
                                        item-text="city"
                                        item-value="id"
                                        hide-details
                                        :return-object="false"
                                        :items="cities"
                                        :rules="[ rules.empty ]" 
                                        v-model="row.cityid">
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-autocomplete label="Причина задержания"
                                        id="offensereason"
                                        v-model="row.reasonid"
                                        item-text="offensereason"
                                        item-value="id"
                                        eager
                                        :return-object="false"
                                        :items="causes"
                                        :rules="[ rules.empty ]" 
                                        hide-details>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row class="text-subtitle-1">
                        <v-col>Информация о ТС&nbsp;<v-icon>mdi-chevron-down</v-icon></v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-combobox label="Марка/модель ТС"
                                            v-model="row.vehiclekindname"
                                            item-text="vehiclekindname"
                                            item-value="vehiclekindname"
                                            :return-object="false"
                                            hide-details
                                            eager
                                            :rules="[ rules.empty ]" 
                                            :items="vcmarks">
                            </v-combobox>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Гос.знак"
                                          v-model="row.vehicleregnum"
                                          clearable
                                          :rules="[ rules.empty ]" 
                                          hide-details>
                            </v-text-field>
                        </v-col>
                    </v-row>
    <template v-if="!has('new')">
                    <v-row class="text-subtitle-1">
                        <v-col>Информация о перемещении&nbsp;<v-icon>mdi-chevron-down</v-icon></v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-autocomplete label="Эвакуатор"
                                        item-text="govnum"
                                        item-value="id"
                                        :return-object="false"
                                        hide-details
                                        eager
                                        :items="evacs"
                                        v-model="row.vehicleevacid">
                                <template v-slot:item="{ item }">
                                    <div style="width:100%;margin-bottom:0.5rem;">
                                        {{ item.govnum }}
                                        <div class="text-truncate text-caption">
                                           {{ item.vcvehicleCrridOrgidShortname }}
                                        </div>
                                    </div>    
                                </template>
                            </v-autocomplete>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-autocomplete label="Стоянка"
                                        item-text="name"
                                        item-value="id"
                                        hide-details
                                        :return-object="false"
                                        eager
                                        :items="parkings"
                                        v-on:input="onparking"
                                        v-model="row.parkingid">
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" sm="6">
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field ref="arrival"
                                          label="Расч.время прибытия на стоянку"
                                          v-model="row.arrivaltime"
                                          readonly
                                          hide-details>
                            </v-text-field>
                        </v-col>
                    </v-row>
    </template>
                </v-card-text>
                <v-card-actions class="py-5">
                    <v-btn color="grey"
                           outlined
                           replace
                           tile
                           :to="{name:'index'}">
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <v-btn type="submit"
                           tile
                           color="primary">
                            {{ has('new') ? 'оформить' : 'изменить' }}&nbsp;
                            <v-icon small class="mdi-rotate-315">mdi-send</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-form>
        <eva-addr-chooser ref="achooser" 
                          v-on:addr="set('addr', $event)" />
    </div>    
</template>
<script>
import { mapState } from 'vuex';
import { isEmpty, MODES, NULL_ID  } from "~/utils/";
import { codec } from "~/utils/http";
import EvaAddrChooser from "~/components/EvaAddrChooser";

import geo from "~/utils/geo.js";
const $moment = require('moment');
$moment.locale('ru');
const utcOff = $moment().utcOffset();


import { _SIN2_VIEWS_IDS } from '~/store/data.js';

const _VIEW_ID = "8190818d-bf31-41d3-8e3c-08582b85f7e9";
const _VIEW_URI= `sin2:/v:${ _VIEW_ID }`;

var _ws = null;
 
export default {
    name: "EvArrest",
    middleware: 'auth',
    components: {
        EvaAddrChooser
    },
    async asyncData({store, params}) {
        
        Object.keys(_SIN2_VIEWS_IDS).map( async k => {
            try {
                await store.dispatch("data/read", k);
            } catch(e){
                console.log('ERR (' + k + ')', e);
            }
        });
        
        var row = {
            id: params.id,
            stateid: null,
            city: null,
            parkingid: null,
            arrivaltime: null
        };
        
        if ( isEmpty(row.id) ){
            row.id = NULL_ID;
            row.at = $moment();
            row.coords = await store.dispatch("geo/current");
            row.cityid = store.getters["profile/region"]?.cityid;
            row.offenseaddress = geo.a2s(store.state.geo.addr?.address);
        } else {
            const res = await store.dispatch("data/transport", params.id);
            row = {...res[0]};
            row.at = $moment(row.createdt);
            row.coords = {
                lat: row.lat,
                lon: row.lon
            };
        }
        
        return {
            row
        };
    },
    data(){
        return {
            MODES, 
            mode: MODES.default,
            handInput: false,
            rules: {
                empty: val => !isEmpty(val) || "Необходимо заполнить"
            }
        };
    },
    async fetch(){
        if (!this.row){
            return;
        }
        this.handInput = false;
        //Def`s for new record
        if ( this.has('new') ){
            /** defs: status, parking */
            this.statuses?.map( s => {
                if (/^(новая)+/gi.test(s.name)){
                    this.row.stateid = s.id;
                }
            });
            
/**TODO:
            if ( 
                    (!!this.parkings)
                 && (this.parkings.length > 0)
               ){
                this.row.parkingid = this.parkings[0].id;
                this.onparking(this.row.parkingid);
            }
*/
            if (    (!this.row.cityid)
                 && (!!this.cities)
                 && (this.cities.length > 0)
               ){
               const city = this.$store.getters['geo/city'];
               const re = new RegExp(`^(${ city })+`, 'gi');
               const n = this.cities.findIndex( c => re.test(c.city) );
               if ( n > -1 ){
                   this.row.city = this.cities[n].city;
               }
            }
        }   // if ( isEmpty...
    },      // fetch
    mounted(){
        this.$nextTick(()=>{
            $(this.$el).find("#offensereason").focus();
        });
    },
    computed: {
        readonly(){
            return this.mode !== MODES.default;
        },
        address(){
            return this.row?.offenseaddress || '';
        },
        coords(){
            if (!!this.row?.coords){
                return `${ Number(this.row.coords.lon).toFixed(5) } / ${Number(this.row.coords.lat).toFixed(5)}`;
            }
            return 'n/a';
        },
        at(){
            return (!!this.row) ? this.row.at.format("DD.MM.YYYY HH:mm") : null;
        },
        parkings(){
            const coords = this.$store.state.geo.ll;
            return this.$store.state.data.parkings?.map( p => {
                p.distance = geo.distance(p, coords);
                return p;
            }).sort( (p1, p2) => { return (p1.distance < p2.distance) ? -1 : 1;} );
        },
        ...mapState({
            statuses: state => state.data.statuses,
            evacs:    state => state.data.evacs,
            vcmarks:  state => state.data.vcmarks,
            causes:   state => state.data.causes,
            cities:   state => state.data.cities
        })
    },
    methods: {
        get(q, val){
            switch(q){
                case "addr":
                    if ( this.has('new') ){
                        ( async ()=>{
                            this.row.coords = await this.$store.dispatch("geo/current");
                            this.handInput = true;
                            if ( isEmpty(this.row.offenseaddress) ){
                                this.row.offenseaddress = geo.a2s(this.$store.state.geo.addr?.address);
                            }
                            this.$nextTick(()=>{
                                $(this.$el).find("input").trigger("focus");
                            });
                            this.$forceUpdate();
                        })();
                    }
                    break;
            }
        },
        set(q, val){
            switch(q){
                case "addr":
                    if ( (val)&&(typeof val === "object") ){
                        this.row.offenseaddress = val.display_name;
                        this.row.coords = {lon: val.lon, lat: val.lat};
                        this.$nextTick(()=>{
                            const el = $(this.$el).find(".hand-address");
                            el.css({opacity: 0, "background-color": "#FFF9C4", color: "#fff"})
                              .animate({opacity: 1}, 'slow', 'linear', ()=>el.css({"background-color": "transparent", color: "initial"}));
                        });
                    } else {
                        this.row.offenseaddress = val;
                    }
                    if ( isEmpty(this.row.offenseaddress) ){
                        this.row.coords = {lat: 0, lon: 0};
                    }
            }
        },
        has(q){
            switch(q){
                case 'addr-err':
                    return (!this.row.coords?.lat) || (!this.row.coords?.lon);
                case "fine":
                    return !!this.$store.state.geo.ll.fine;
                case 'new':
                    return (!this.row?.id)||(NULL_ID === this.row.id);
            }
            return false;
        },
        lookup(){
            this.$refs["achooser"].open(this.row.offenseaddress);
/*            
            geo.lookup({q: this.row.offenseaddress}).then( res => {
                console.log('lookup', res);
            });
* 
*/
        },
        async save(){
            if ( !this.$refs["form"].validate() ){
                return false;
            }
            
            const opts = {
                    type: "core-update",
                    query: _VIEW_URI,
                    params: [
                                {id: 'createdt',        type: 'datetime', value: $moment(this.row.at).add(utcOff,'minutes').toDate()},
                                {id: 'cityid',          type: 'id',       value: this.row.cityid},
                                {id: 'stateid',         type: 'id',       value: this.row.stateid},
                                {id: 'reasonid',        type: 'id',       value: this.row.reasonid},
                                {id: 'vehiclekindname', type: 'string',   value: this.row.vehiclekindname},
                                {id: 'vehicleregnum',   type: 'string',   value: this.row.vehicleregnum},
                                {id: 'offenseaddress',  type: 'string',   value: this.address},
                                {id: 'lat',             type: 'string',   value: this.row.coords.lat},
                                {id: 'lon',             type: 'string',   value: this.row.coords.lon}
                    ]
            }   //opts
            
            if (!!this.row.arrivaltime){
                opts.params.push({id: 'arrivaltime', type: 'string', value: this.row.arrivaltime});
            }
            if (!!this.row.vehicleevacid){
                opts.params.push({id: 'vehicleevacid', type: 'id', value: this.row.vehicleevacid});
            }
            if (!!this.row.parkingid){
                opts.params.push({id: 'parkingid', type: 'id', value: this.row.parkingid});
            }
            
            if (this.row.id === NULL_ID){
                opts.type = "core-create";
            } else {
                opts.params.push({id: 'id', type: 'id',  value: this.row.id});
            }

            this.mode = MODES.saving;
            
            console.log('SAVE', opts);
            
            try {
                const res = await $nuxt.api(opts);
                if (res.result){
                    this.mode = MODES.success;
                } else {
                    throw res.error;
                }
                
                const id = (this.row.id === NULL_ID) ? res.result[_VIEW_ID] : this.row.id;
                
                if (!_ws){
                    _ws = await $nuxt.ws();
                }
                _ws.publish('PUBLIC.EVA.arrest', codec.encode({ id }));
                
                setTimeout(()=>{
                    this.$router.replace({name: "index", params:{ id }});
                }, 666);
            } catch(e){
                this.mode = MODES.error;
                this.error = e;
                console.log('ERR (save)', e);
            }
                    
            
            return false;
        },
        onparking(id){
            const n = this.parkings.findIndex( p => (p.id === id) );
            const p = this.parkings[n];
            if (!!p){
                const at = this.row.at.clone();
                this.row.arrivaltime = at.add(p.distance / 15000, 'hours').add(15, 'minutes').format('HH:mm');
                this.$forceUpdate();
            }
        }
    }
}    
</script>
<style lang="scss">
    .ev-arrest{
        & .v-toolbar{
            height: fit-content;
            font-size: 0.9rem;
            line-height: 1.125;
            &__content{
                justify-content: space-between;
            }
            & .address {
                width: 100%;
                height: fit-content;
                padding: 8px 16px;
                justify-content: space-between;
                line-height: 1.125;
                & .coords {
                    font-size: 0.55rem;
                }
            }
        }
        & .v-card{
            &__text{
                & .v-btn {
                    &__content{
                        flex-wrap: nowrap;
                        align-content: center;
                        justify-content: space-between;
                        text-transform: none;
                    }
                }
            }
            &__actions{
                justify-content: flex-end;
            }
        }
        & .v-menu {
            &__content{
                & .v-list-item{
                    display: block;
                }
            }
        }
        
        & .row {
            & > *{
                padding-top: 0;
            }
            &.text-subtitle-1 {
                & .col{
                    padding-top: 12px;
                    padding-bottom: 0;
                }        
            }
        }
    }
</style>
