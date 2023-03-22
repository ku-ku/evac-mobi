<template>
  <v-list>
    <v-list-item v-on:click="go" v-for="gov in govs">
      132
      {{ gov.gov }} <br>
      {{ gov.dt }}
    </v-list-item>
  </v-list>
</template>
<script>
const _LS_KEY = 'saved-govs';

  export default {
    name: 'EvaGovList',
    data() {
      const govs = [{
        govnum: 1,
        dt: new Date(),
        id: 1000
      }];

      return {
        govs
      }
    },

    created(){
      this.govs = JSON.parse(localStorage.getItem(_LS_KEY)) || [];
    },

    methods: {
      go(gov) {
      gov.dt = new Date();
      localStorage.setItem('govs', JSON.stringify(this.govs))
      this.$emit('go',gov)
      },

      save(gov){
        gov.dt = new Date();
        this.govs.push(gov);
        localStorage.setItem(_LS_KEY, JSON.stringify(this.gov));
      }
    },
  }
</script>
