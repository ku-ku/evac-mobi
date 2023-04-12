<template>
    <div class="eva-govs">
        <v-list v-if="(govs.length > 0)">
            <v-list-item v-for="gov in govs"
                          :key="gov.id"
                          v-on:click="go(gov.id)">
                <v-list-item-title>
                    {{ gov.govnum }}
                    <div class="dt">
                        {{ moment(gov.dt).format('DD.MM.YYYY HH:mm') }}
                    </div>
                </v-list-item-title>
                <v-list-item-action>
                    <v-icon>mdi-chevron-right</v-icon>
                </v-list-item-action>
             </v-list-item>
        </v-list>
    </div>

</template>
<script>
const _LS_KEY = 'saved-govs';
const moment = require("moment");
moment.locale('ru');

export default {
    name: 'EvaGovList',
    data(){
        return { 
            moment
        };
    },

    methods:{
        go(id){
            this.$store.commit('go', {id})
            // const n = this.govs.findIndex( gov => gov.id === id);
            // this.govs[n].dt = new Date();
            // this.govs[q] = this.$store.getters["settings/govs"];
            // this.$emit('go', this.govs[n]);
        },
        
        save(gov){
            this.$store.commit('save', {gov})
         //     const n = this.govs.findIndex( _gov => _gov.id === gov.id );
        //     if ( n < 0 ) {
        //         gov.dt = new Date();
        //         this.govs.push(gov); 
        //     } else {
        //         this.govs[n].dt = new Date();
        //     }
        //     this.govs[q] = this.$store.getters["settings/govs"];
        // }
    }
},
    computed: {
        govs(){
            return this.$store.getters["settings/govs"]

        }
    }
}
</script>
<style lang="scss">
.eva-govs{
    & .v-list{
        &-item{
            padding-bottom: 0.5rem;
            &__title{
                font-size: 2rem !important;
                text-transform: uppercase;
                & .dt{
                    color: #666;
                    font-size: 1rem !important;
                    font-weight: 300;
                }
            }
        }
    }
}
</style>
