<template>
    <v-dialog v-model="show"
              scroll
              content-class="ev-addrs">
        <v-toolbar elevation="1"
                   class="py-3"
                   height="auto"
                   dark
                   color="blue-grey">
            {{ q }}
            <v-spacer />
            <v-btn icon
                   v-on:click="show = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-toolbar>
        <v-list>
            <v-list-item v-for="a in addrs"
                         :key="a.place_id"
                         v-on:click="$emit('addr', a); show=false;">
                <v-list-item-content>
                    {{ a.display_name }}
                    <div class="coords">
                        {{ Number(a.lon).toFixed(5) }} / {{ Number(a.lat).toFixed(5) }}
                    </div>
                </v-list-item-content>
                <v-list-item-action>
                    <v-icon>mdi-chevron-right</v-icon>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </v-dialog>
</template>
<script>
import { isEmpty } from '~/utils';
import geo from "~/utils/geo";

export default {
    name: 'EvaAddrChooser',
    data(){
        return {
            q: null,
            show: false,
            addrs: []
        };
    },
    async fetch(){
        this.addrs = [];
        if ( isEmpty(this.q) ){
            return false;
        }
        try {
            this.addrs = await geo.lookup({q: this.q});
        } catch(e){
            console.log('ERR (lookup)', e);
            $nuxt.msg({text: `Ошибка распознавания адреса "${this.q}"`});
        }
    },
    methods: {
        async open(q){
            this.q = q;
            await this.$fetch();
            if (this.addrs.length === 1){
                const addr = this.addrs[0];
                addr.only = true;
                this.$emit("addr", addr);
            } else if (this.addrs.length > 1){
                this.show = (new Date()).getTime();
            } else {
                $nuxt.msg({text: `Указанный адрес <strong>"${this.q}"</strong> не распознан, уточните и попробуйте еще раз`});
            }
        }
    }
}    
</script>
<style lang="scss">
    .ev-addrs{
        & .v-list{
            &-item{
                &__content{
                    line-height: 1.25;
                    & .coords{
                        font-size: 0.9rem;
                        color: var(--v-primary-base);
                    }
                }
            }
        }
    }
</style>