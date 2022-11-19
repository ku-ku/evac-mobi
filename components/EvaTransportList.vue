<template>
    <v-card
        flat
        tile
        class="eva-transport">
        <v-card-text v-if="has('one')" 
                     class="eva-one elevation-3">
            <template v-for="t in transport">
                <h3>информация о задержании<small>транспортного средства</small></h3>
                <v-row class="flex-nowrap mt-3 mb-5">
                    <v-col cols="3" col-sm="2"
                           class="eva-one__dt"
                           v-html="get('dt2', t.createdt)">
                    </v-col>
                    <v-col class="eva-one__vehicle text-center">
                        {{ t.vehicleregnum }}
                        <small class="kind">{{ t.vehiclekindname }}</small>
                    </v-col>
                    <v-col cols="3"  col-sm="2"
                           class="eva-one__wait">
                         {{t.arrivaltime.replace(/\D+/, ':') }}<br />
                         <small>время прибытия на парковку</small>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" class="addr">
                        <v-icon small>mdi-map-marker-outline</v-icon>{{ t.offenseaddress }}
                        <small>адрес задержания</small>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" class="addr">
                        <v-icon small>mdi-map-marker-radius</v-icon>{{ t.evacoffensejournalParkingidName }}
                        <small>адрес стоянки</small>
                        <v-row class="justify-space-around mt-5 mb-5">
                            <v-col cols="12" col-sm="6" class="text-center"
                                   v-if="!empty(t.evacoffensejournalParkingidPhone)">
                                <a :href="'tel://'+t.evacoffensejournalParkingidPhone"
                                   class="v-btn v-btn--is-elevated v-btn--has-bg v-btn--tile theme--light v-size--default primary">
                                    <v-icon small>mdi-phone</v-icon>{{t.evacoffensejournalParkingidPhone}}
                                </a>
                                <small>звонок на стоянку</small>
                            </v-col>    
                            <v-col cols="12" col-sm="6" class="text-center">
                                <v-btn v-on:click="gomap(t)"
                                       tile
                                       color="primary">
                                    <v-icon small>mdi-map</v-icon>открыть карту
                                </v-btn>
                                <small>посмотреть местонахождение</small>
                            </v-col>
                        </v-row>    
                    </v-col>
                </v-row>
            </template>    
        </v-card-text>
        <v-card-text v-else>
            <v-list class="eva-transport__list"
                    v-bind:class="{'eva-error': has('error')}">
                <template v-if="has('error')">
                    <v-list-item v-if="has('error')">
                        <v-alert type="warning" 
                                 outlined>
                            Что-то пошло не так - мы не смогли получить список задержанных транспортных средств.<br />
                            Попробуйте обновить страницу через несколько минут.<br />
                            <small>детали ошибки для технической службы: {{ error.message }}</small>
                        </v-alert>
                    </v-list-item>
                </template>    
                <template v-else-if="$fetchState.pending">
                    <v-subheader class="justify-end">
                        загрузка списка задержанного транспорта...
                    </v-subheader>    
                    <v-skeleton-loader type="list-item-avatar-two-line@3"></v-skeleton-loader>
                </template>
                <template v-else>
                    <v-subheader>
                        <v-row>
                            <v-col cols="12" class="d-flex justify-space-between">
                                <div>
                                    Перечень задержанных транспортных средств
                                    <div class="small" v-if="has('search')">
                                        <v-badge v-if="(transport.length > 0)"
                                                 color="secondary"
                                                 offset-x="-8px"
                                                 offset-y="12px"
                                                 :content="transport.length">
                                            найдено
                                        </v-badge>
                                        <v-alert v-else
                                                 type="warning"
                                                 icon="mdi-alert-outline"
                                                 dense
                                                 outlined>
                                            по запросу "{{ s }}" ничего не найдено
                                        </v-alert>
                                    </div>
                                </div>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <div class="eva-transport__at" 
                                             v-html="at"
                                             v-on="on">
                                        </div>
                                    </template>
                                    <span>время обновления списка</span>
                                </v-tooltip>
                            </v-col>    
                        </v-row>
                        <v-row class="list-header">
                            <v-col class="dt">
                                время регистрации нарушения
                            </v-col>    
                            <v-col class="vehicle">
                                информация о задержании
                            </v-col>
                            <v-col class="tel ml-auto d-none d-sm-block">
                                <v-icon small>mdi-phone</v-icon>&nbsp;стоянки
                            </v-col>
                            <v-col cols="auto" class="d-none d-sm-block wait">
                                время прибытия на стоянку
                            </v-col>
                        </v-row>
                    </v-subheader>
                    <v-list-item-group v-model="selitem">
                        <v-list-item v-for="t in transport"
                                     :key="t.id"
                                     :value="t.id"
                                     :input-value="t.id"
                                     v-on:click="edit(t)">
                            <v-row>
                                <v-col class="dt" v-html="get('dt', t.createdt)"></v-col>
                                <v-col col="auto" class="vehicle">
                                    <div class="gov">
                                        {{ t.vehicleregnum }}
                                        &nbsp;<span class="kind">{{ t.vehiclekindname }}</span>
                                    </div>
                                    <div class="meta">
                                        <div class="addr"><v-icon x-small>mdi-map-marker-outline</v-icon>{{ t.offenseaddress }}</div>
                                        <div class="parking"><v-icon x-small>mdi-map-marker-radius</v-icon>стоянка:&nbsp;{{ t.evacoffensejournalParkingidName }}</div>
                                        <div class="wait d-block d-sm-none ml-auto">
                                            <v-icon x-small>mdi-clock-outline</v-icon>
                                            {{t.arrivaltime.replace(/\D+/, ':') }}
                                        </div>
                                    </div>
                                    <div class="meta">
                                        <div class="status">
                                            <v-icon x-small>mdi-flag-variant</v-icon>
                                            {{ t.evacoffensejournalStateidName }}
                                        </div>
                                        <div class="phone ml-sm-auto"
                                             v-if="!empty(t.evacoffensejournalParkingidPhone)">
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-icon x-small>mdi-phone</v-icon>
                                                    <a :href="'tel://'+t.evacoffensejournalParkingidPhone"
                                                       v-on="on">
                                                        {{t.evacoffensejournalParkingidPhone}}
                                                    </a>
                                                </template>
                                                <span>позвонить на стоянку</span>
                                            </v-tooltip>    
                                        </div>
                                    </div>
                                </v-col>
                                <v-col class="d-none d-sm-block text-right wait">
                                    {{ t.arrivaltime.replace(/\D+/, ':') }}
                                </v-col>
                            </v-row>
                        </v-list-item>
                    </v-list-item-group>    
                </template>
            </v-list>
        </v-card-text>
        <v-card-actions v-if="(has('all') && (all.length > PAGE_SIZE) && !has('search') )">
            <v-pagination v-model="page" 
                          :length="((all.length / PAGE_SIZE) | 0) + 1"
                          v-on:input="onpage">
            </v-pagination>
        </v-card-actions>
    </v-card>
</template>
<script>
import { isEmpty as empty } from "~/utils";

const $moment = require("moment");
const now = $moment().format("DD.MM.YYYY");
const PAGE_SIZE = 20;

var hTimer = false; //for search input

export default {
    name: 'EvaTransportList',
    fetchOnServer: false,
    data(){
        return {
            PAGE_SIZE,
            at: '-',
            s: null,
            all: null,
            error: null,
            page: 1,
            selitem: null
        };
    },
    async fetch(){
        this.error = null;
        try {
            this.all = [ ...await this.$store.dispatch("data/transport") ];
            const dt = $moment();
            this.at = `${ dt.format("HH:mm") }<small>${ dt.format("DD.MM.YYYY") }</small>`;
            this.page = 1;
        } catch(e){
            this.error = e;
            $nuxt.msg({text:"Ошибка получения списка эвакуированных транспортных средств", timeout:20000, color:"warning"});
            console.log('ERR (transport)', e);
        }
    },
    computed: {
        /**
         * Filtering list by "s"
         * @returns {Array}
         */
        transport(){
            if (!!this.all){
                return this.all.slice((this.page - 1) * PAGE_SIZE, this.page * PAGE_SIZE);
            } 
            return null;
        }   //transport
    },
    methods: {
        empty,
        has(q){
            switch(q){
                case "all":
                    return (this.all?.length > 0);
                case "one":
                    return (this.transport?.length === 1);
                case "search":
                    return (!empty(this.s)&&(this.s.length > 1));
                case "error":
                    return (!!this.error);
                case "xs":
                    return (!!$nuxt.$vuetify.breakpoint.xs);
            }
        },
        get(q, val){
            switch(q){
                case "dt":
                    var m = $moment(val);
                    return `${ m.format("HH:mm") }<div class="dt">${ m.format("DD.MM.YYYY") }</div>`;
                case "dt2":
                    var m = $moment(val);
                    return `${ m.format("HH:mm") }<div class="dt">${ m.format("DD.MM.YYYY") }</div><small>время регистрации</small>`;
            }
            return null;
        },
        refresh(){
            this.$store.commit("data/set", {transport: null}); //reset
            this.s = null;
            $(this.$el).find('input').val('');
            this.$fetch();
        },
        onpage(){
            this.$nextTick( ()=> $nuxt.$vuetify.goTo(0) );
        },
        edit(t){
            this.selitem = t.id;
            this.$router.push({ name: 'arrest-id', params: {id: t.id} });
        },
        async highlight(id){
            try {
                const _t = await this.$store.dispatch("data/transport", id);
                if (_t.length > 0){
                    const t = _t[0];
                    const n = this.all.findIndex( a => a.id === t.id );
                    if ( n < 0 ){
                        this.all.unshift(t);
                    } else {
                        this.all.splice(n, 1, t);
                    }
                    console.log('changed', n, t);
                    this.selitem = t.id;
                    this.$forceUpdate();
                } else {
                    console.log(`No #${ id } data loaded `);
                }
            } catch(e){
                console.log(e);
                $nuxt.msg({text:'Ошибка обновления списка ТС', color: 'warning'});
            }
        }   //highlight
    }
}
</script>
<style lang="scss" >
    .eva-transport {
        & .v-card{
            &__actions{
                justify-content: center;
            }
        }
        &__at {
            font-size: 1.25rem;
            line-height: 1.115;
            margin-left: 1rem;
            padding-right: 0;
            text-align: center;
            & small {
                display: block;
                font-size: 0.55rem !important;
            }
        }
        &__list:not(.eva-error){
            & .v-list-item {
                color: #455A64;
                border-bottom: 1px solid #ccc;
                padding-top: 0.5rem;
                padding-bottom: 0.5rem;
                & .row{
                    flex-wrap: nowrap;
                    align-items: center;
                }
            }
            & .dt{
                text-align: center;
                font-size: 1rem;
                padding-left: 0;
                padding-right: 0;
                max-width: 5rem;
                & .dt {
                    font-size: 0.7rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            & .vehicle{
                line-height: 1.125;
                text-align: left;
                & .gov{
                    font-size: 1.25rem;
                    text-transform: uppercase;
                    color: #0D47A1;
                }
                & .kind{
                    font-size: 0.85rem;
                    color: #455A64;
                }
                & .meta {
                    font-size: 0.85rem;
                    display: flex;
                    flex-wrap: wrap;
                    align-content: center;
                    align-items: center;
                    & > *:not(:last-child)  {
                        margin-right: 0.5rem;
                    }
                    & .addr, &.parking {
                        max-width: 16rem;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    & .v-icon{
                        margin-right: 0.3rem;
                    }
                }
            }
            & .wait{
                max-width: 5rem;
                text-align: right;
                padding-right: 0;
            }
            & .v-subheader{
                display: block;
                height: fit-content;
                margin-bottom: 1rem;
                & .row {
                    flex-wrap: nowrap;
                    align-content: center;
                    justify-content: space-between;
                    align-items: center;
                    line-height: 1.125;
                    & .small{
                        font-size: 0.75rem;
                        padding: 0.5rem 0;
                    }
                    &.list-header{
                        font-size: 0.75rem !important;
                        font-weight: bold;
                        font-style: italic;
                        & .dt{
                            font-size: 0.75rem !important;
                            max-width: 5rem;
                            padding: 0;
                        }
                        & .wait{
                            max-width: 6rem;
                            text-align: right !important;
                        }
                        & .tel{
                            max-width: 8rem;
                            text-align: center;
                        }
                    }
                    border-bottom: 1px solid #ccc;
                }
            }   /* .v-subheader */
            & .v-list-item--active{
                background-color: var(--v-primary-base);
                color: #fff;
                & a {
                    color: #fff;
                }
                & .vehicle{
                    & .gov, & .kind{
                        color: #fff;
                    }
                }
            }
        }       /* __list */
    }
    .page-content ul li {
        margin: 0 !important;
        &:before{
            display: none !important;
        }
    }
    .eva-one{
        font-size: 1.25rem !important;
        margin-top: 2rem;
        line-height: 1.125;
        & h3{
            font-weight: 300;
            text-align: right;
        }
        a{
            text-decoration: none;
        }
        & .v-btn{
            width: 14rem;
            & .v-icon{
                color: #fff;
            }
        }
        & small{
            display: block;
            font-size: 0.75rem;
            color: #999;
            line-height: 1.115;
        }
        &__dt, &__wait {
            text-align: center;
            & .dt{
                font-size: 0.75rem;
            }
        }
        &__vehicle{
            font-size: 1.5rem;
            text-transform: uppercase;
            color: #0D47A1;
            & .kind{
                font-size: 0.9rem;
                color: #455A64;
            }
        }
        & .v-icon{
            margin-right: 0.5rem;
        }
    }
</style>