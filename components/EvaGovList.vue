<template>
  <div class="eva-govs">
    <v-list v-if="(govs.length > 0)">
      <v-list-item v-for="gov in govs2" 
                   :key="gov.id" 
                   v-on:click="go" >
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
    data() {
      const govs = [{
        govnum: 1,
        dt: new Date(),
        id: 1000
      }];

      return {
        moment,
        govs
      };
    },

    created(){
      this.govs = JSON.parse(localStorage.getItem(_LS_KEY)) || [];
    },

    methods: {
      go(id) {
        const n = this.govs.findIndex( gov => gov.id === id );
        this.govs[n].dt = new Date();
        localStorage.setItem(_LS_KE, JSON.stringify(this.govs));
        this.$emit('go',this.govs[n]);
      },

      save(gov){
        const n =this.govs.findIndex( _gov => _gov.id === gov.id );
        if ( n < 0){
          gov.dt = new Date();
          this.govs.push(gov);
        }
        else {
          this.govs[n].dt = new Date();
        }
        localStorage.setItem(_LS_KEY, JSON.stringify(this.govs));
      },
    },
    computed: {
      govs2(){
        return this.govs?.map( g =>{
          g.dt = moment(g.dt).toDate();
          return g;
        }).sort((g1, g2) => {
          console.log(g1, g2);
          return g2.dt.getTime() - g1.dt.getTime();
        }) || []
      },
    }
  }
</script>
<style lang="scss" scoped>
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
