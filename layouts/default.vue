<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="nav"
      temporary
      fixed
      app>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app>
      <v-app-bar-nav-icon v-on:click.stop="nav = !nav" />
      <div class="ev-title" v-html="title"></div>
      <v-spacer />
      <v-btn icon v-on:click="logout"><v-icon small>mdi-logout</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt :keep-alive-props="{ exclude: ['auth'] }" />
      </v-container>
    </v-main>
    <v-footer app>
        <v-spacer />
        <span class="ev-addr"
              v-if="has('addr')">
            {{ addr }}
        </span>
        <v-btn small icon 
               v-on:click="get('geo')">
            <v-icon small
                    :color="has('fine') ? 'default' : 'error'">
                {{ has('fine') ? 'mdi-map-marker' : 'mdi-map-marker-alert' }}
            </v-icon>
        </v-btn>
        <eva-link-status />
    </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';    
import { isEmpty } from '~/utils/';
import geo from '~/utils/geo';
import EvaLinkStatus from "~/components/EvaLinkStatus";

export default {
    name: 'DefaultLayout',
    components: {
        EvaLinkStatus
    },
    data() {
        return {
            nav: false
        };
    },
    methods: {
        get(q){
            switch(q){
                case "geo":
                    this.$store.dispatch("geo/current");
                    break;
            }
        },
        has(q){
            switch(q){
                case "addr":
                    return !isEmpty(this.addr);
                case "fine":
                    return !!this.$store.state.geo.ll.fine;
            }
            return false;
        },
        logout(){
            this.$store.dispatch("profile/logout").then(()=>{
                this.$router.replace({name: "auth"});
            });
        }
    },
    computed: {
        title(){
            var s = this.user?.title || '',
                t = this.user?.tenants[this.user?.tenantId];
            if (!!t){
                s += `<div class="ev-tenant text-truncate">${ t.title }</div>`;
            }
            
            return s;
        },
        ...mapState({
            addr: state => geo.a2s(state.geo.addr?.address),
            user: state => state.profile.subject
        })
    }
}
</script>
<style lang="scss" scoped>
    .v-toolbar{
        & .ev-title{
            line-height: 1.125;
            font-size: 0.85rem;
        }
    }
    .v-footer{
        font-size: 0.85rem;
    }
    
</style>