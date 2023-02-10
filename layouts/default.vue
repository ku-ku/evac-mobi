<template>
  <v-app dark>
    <v-navigation-drawer v-model="nav"
                         v-if="has('subject')"
                         temporary
                         fixed
                         app>
        <v-list dense
                nav>
            <v-list-item v-if="has('evacuator')"
                         v-on:click="evChange">
                <v-list-item-icon><v-icon small color="primary">mdi-tow-truck</v-icon></v-list-item-icon>
                <v-list-item-content>
                    <v-list-item-title class="text-uppercase">{{get('evaGov')}}</v-list-item-title>
                    <v-list-item-subtitle>Выбрать другой эвакуатор</v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="has('region')">
                <v-list-item-icon><v-icon>mdi-map-marker-check</v-icon></v-list-item-icon>
                <v-list-item-title>{{ get("regiName") }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-else>
                <v-list-item-icon><v-icon color="red">mdi-map-marker-alert</v-icon></v-list-item-icon>
                <v-list-item-title>Район не определен</v-list-item-title>
            </v-list-item>
            <v-list-item
                :to="{name: 'qr'}">
                <v-list-item-icon><v-icon>mdi-qrcode</v-icon></v-list-item-icon>
                <v-list-item-title>QR для авторизации</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app>
      <v-app-bar-nav-icon v-on:click.stop="nav = !nav" />
      <div class="ev-title" v-html="title()"></div>
      <v-spacer />
      <v-btn icon v-on:click="logout"><v-icon small>mdi-logout</v-icon></v-btn>
    </v-app-bar>
    <v-main>
      <v-container v-bind:class="{map: has('map')}">
        <Nuxt keep-alive :keep-alive-props="{ exclude: ['SignInPage', 'EvaTransportList', 'EvArrest'] }" />
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
    async created(){
        await this.$store.dispatch("data/read", "cities");
    },
    methods: {
        get(q){
            switch(q){
                case "geo":
                    this.$store.dispatch("geo/current");
                    break;
                case "regiName":
                    const { cityid } = this.user.region;
                    const n = this.cities?.findIndex( r => r.id === cityid);
                    return ( n > -1 ) ? this.cities[n].city : '';
                case "evaGov":
                    return this.$store.state.profile.subject?.evacuator?.govnum;
            }   //get
        },
        has(q){
            switch(q){
                case "addr":
                    return !isEmpty(this.addr);
                case "fine":
                    return !!this.$store.state.geo.ll.fine;
                case "subject":
                    return !isEmpty(this.user?.id);
                case "region":
                    return (!!this.user?.region);
                case "map":
                    return 'map'===this.$route.name;
                case "evacuator":
                    return this.$store.getters["profile/is"]("evacuator");
            }
            return false;
        },
        title(){
            var s = this.user?.title || '',
                t = this.user?.tenants[this.user?.tenantId];
            if (this.has("evacuator")){
                const evacuator = this.$store.state.profile.subject?.evacuator;
                s = (!!evacuator) ? `<div class="text-uppercase">${ evacuator.govnum }</div><div class="ev-tenant text-truncate">${evacuator.vcvehicleCrridOrgidShortname}</div>` : "Выбрать ТС";
            } else {
                if (!!t){
                    s += `<div class="ev-tenant text-truncate">${ t.title }</div>`;
                }
            }
            return s;
        },
        evChange(){
            this.$store.commit("profile/set", {evacuator: null});
            window.location.reload();
        },
        logout(){
            this.$store.dispatch("profile/logout").then(()=>{
                this.$router.replace({name: "auth"});
            });
        }
    },
    computed: {
        ...mapState({
            addr: state => geo.a2s(state.geo.addr?.address),
            user: state => state.profile.subject,
            cities: state => state.data.cities
        })
    }
}
</script>
<style lang="scss">
    .v-toolbar{
        & .ev-title{
            line-height: 1.125;
            font-size: 1rem;
            & .ev-tenant{
                font-size: 0.75rem;
            }
        }
    }
    .v-footer{
        font-size: 0.85rem;
    }
    .container{
        &.map{
                max-width: 100%;
                padding:0;
                height: 100%;
                min-height: 100%;
        }
    }
</style>