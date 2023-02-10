<template>
  <v-app>
    <v-main>
      <v-container v-bind:class="{map: has('map')}">
        <nuxt keep-alive />
      </v-container>
    </v-main>
  </v-app>
</template>
<script>
export default {
    data(){
        return {}
    },
    methods: {
        has(q){
            switch(q){
                case 'map':
                    return 'map'===this.$route.name;
            }
            return false;
        }
    }
}    
</script>
<style lang="scss">
    .container.map{
        max-width: 100%;
        padding:0;
        height: 100%;
        min-height: 100%;
    }
</style>