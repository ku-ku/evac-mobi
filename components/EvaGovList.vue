<template>
  <v-list>
    <v-list-item v-on:click="go" v-for="gov in govs">
      {{ gov.gov }} <br>
      {{ gov.data }}
    </v-list-item>
  </v-list>
</template>
<script>

  export default {
    name: 'EvaGovNum',
    data() {
      return {
        govs : [{gov:(n), dt:(data), id:(idgov)}]
      }
    },

    created(){
      //this.govs = JSON.parse(govs)
    },

    methods: {
      go(gov) {
      gov.dt = new Date();
      JSON.setItem('govs', JSON.stringify(this.govs))
      this.$emit('go',gov)
      }
    },
  }
</script>
