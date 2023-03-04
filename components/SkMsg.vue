<template>
<v-snackbar v-model="hasSnackbar"
            class="sk-app-snackbar"
            bottom
            dark
            :color="snackbar.color"
            :timeout="snackbar.timeout">
        <div v-html="snackbar.text"></div>
        <v-btn x-small absolute dark fab :color="snackbar.color" @click="hasSnackbar=false">
            <v-icon small>mdi-close</v-icon>
        </v-btn>
</v-snackbar>
</template>
<script>
import { 
        VSnackbar,
        VBtn,
        VIcon
} from 'vuetify/lib';
import { isEmpty } from '~/utils';
    
export default {
    name: 'SkMsg',
    components: {
        VSnackbar,
        VBtn,
        VIcon
    },
    data(){
        return {
            snackbar: false //bool | {color,timeout,text}
        };
    },
    computed: {
        hasSnackbar: {
            get(){ return !!this.snackbar; },
            set(val){
                if (!val){
                    this.snackbar = false;
                }
            }
        }
    },
    methods: {
        show(e){
            if (!(!!e)||isEmpty(e.text)){
                this.snackbar = false;
                return;
            }
            const sb = {
                    color: (!!e.color) ?  e.color : "primary",
                    timeout: (!!e.timeout) ? e.timeout : 6000,
                    text: e.text
            };
            this.snackbar = sb;
        }
    }
};
</script>    
<style lang="scss">
    .sk-app-snackbar{
        & .v-snack__wrapper{
            max-width: calc(100% - 42px) !important;
            & .v-snack__content{
                font-size: 0.85rem;
                line-height: 1.125;
            }
        }
        & .v-btn{
            position: absolute;
            top: -14px;
            right: -12px;
            color: #f2f2f2;
            background: #f2f2f2;
            border: 1px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.18);
        }
    }
</style>