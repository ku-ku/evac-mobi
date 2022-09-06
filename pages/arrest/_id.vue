<template>
    <v-form v-on:submit.stop.prevent="save">
        <v-card class="ev-arrest">
            <v-toolbar dark
                       elevation="0"
                       color="primary">
                <v-toolbar-title>
                    <v-btn block
                           text
                           tile
                           class="address"
                           v-on:click="get('addr')">
                        <div>
                            {{ address }}
                            <div class="coords">
                                {{ coords }}
                            </div>
                        </div>
                        <v-icon>{{ has('fine') ? 'mdi-map-marker' : 'mdi-map-marker-alert'}}</v-icon>
                    </v-btn>
                </v-toolbar-title>
            </v-toolbar>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-autocomplete label="Район/МО"
                                    item-text="city"
                                    item-value="city"
                                    hide-details
                                    :return-object="false"
                                    :items="cities"
                                    v-model="row.city">
                        </v-autocomplete>
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
                                    :return-object="false"
                                    :items="statuses"
                                    v-model="row.stateid">
                        </v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-combobox label="Марка/модель ТС"
                                        v-model="row.vehiclekindname"
                                        item-text="vehiclekindname"
                                        item-value="vehiclekindname"
                                        eager
                                        hide-details
                                        :items="vcmarks">
                        </v-combobox>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field label="Гос.знак"
                                      v-model="row.vehicleregnum"
                                      clearable
                                      hide-details>
                        </v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-autocomplete label="Эвакуатор"
                                    item-text="govnum"
                                    item-value="id"
                                    hide-details
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
                                    :items="parkings"
                                    v-on:input="onparking"
                                    v-model="row.parkingid">
                        </v-autocomplete>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-combobox label="Причина задержания"
                                    v-model="row.offensereason"
                                    item-text="offensereason"
                                    item-value="offensereason"
                                    :items="causes"
                                    hide-details>
                        </v-combobox>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field ref="arrival"
                                      label="Расч.время прибытия"
                                      v-model="row.arrivaltime"
                                      readonly
                                      hide-details>
                        </v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
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
                    оформить&nbsp;<v-icon small class="mdi-rotate-315">mdi-send</v-icon></v-btn>
            </v-card-actions>
        </v-card>
    </v-form>    
</template>
<script>
import { mapState } from 'vuex';
import { isEmpty } from "~/utils/";
import geo from "~/utils/geo.js";
const $moment = require('moment');
$moment.locale('ru');

import { _SIN2_VIEWS_IDS } from '~/store/data.js';

export default {
    name: "EvArrest",
    middleware: 'auth',
    async asyncData({store, params}) {
        
        Object.keys(_SIN2_VIEWS_IDS).map( async k => {
            try {
                await store.dispatch("data/read", k);
            } catch(e){
                console.log(`ERR (${ k })`, e);
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
            row.at = $moment();
            row.coords = await store.dispatch("geo/current");
        } else {
            const res = await store.dispatch("data/transport", params.id);
            row = {...res[0]};
            row.at = $moment(row.createdt);
        }
        
        return {
            row
        };
    },
    async fetch(){
        if (!this.row){
            return;
        }
        //Def`s for new record
        if ( isEmpty(this.row.id) ){
            /** defs: status, parking */
            this.statuses?.map( s => {
                if (/^(новая)+/gi.test(s.name)){
                    this.row.stateid = s.id;
                }
            });
            if ( 
                    (!!this.parkings)
                 && (this.parkings.length > 0)
               ){
                this.row.parkingid = this.parkings[0].id;
                this.onparking(this.row.parkingid);
            }
            
            
            if ( 
                    (!!this.cities)
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
    },
    computed: {
        address(){
            if ( isEmpty(this.row?.id) ) {
                return geo.a2s(this.$store.state.geo.addr?.address);
            } else {
                return this.row.offenseaddress;
            }
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
                    if ( isEmpty(this.row.id) ){
                        ( async ()=>{
                            this.row.coords = await this.$store.dispatch("geo/current");
                            this.$forceUpdate();
                        })();
                    }
                    break;
            }
        },
        has(q){
            switch(q){
                case "fine":
                    return !!this.$store.state.geo.ll.fine;
            }
            return false;
        },
        save(){
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
            font-size: 1rem;
            &__content{
                padding: 0;
            }
            &__title{
                width: 100%;
            }
        }
        & .v-btn.address {
            height: fit-content;
            padding: 8px 16px;
            & .v-btn__content{
                height: fit-content;
                justify-content: space-between;
                width: 100%;
                & > div:first-child{
                    font-weight: normal;
                    width: calc(100% - 32px);
                    white-space: normal;
                    word-break: normal;
                }
                & .coords{
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
    }
</style>
