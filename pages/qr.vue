<template>
    <v-card class="qr-auth"
            tile
            v-bind:class="{'qr-error': (!!error)}">
        <v-card-text>
            <v-img ref="qr"
                   alt=""
                   min-width="320"
                   max-width="480"
                   height="auto"
                   v-on:error="onerror"
                   :src="qrUrl" />
            <div class="err-msg"
                 v-if="(!!error)">
                ВНИМАНИЕ! QR-код не сформирован. 
                <div class="small">Сообщение об ошибке: {{error.data || error.message}}</div>
            </div>
            <div v-else class="qr-hash">
                {{ hash }}
            </div>
        </v-card-text>
        <v-card-actions>
            <v-btn v-on:click="$router.go(-1)"
                   outlined
                   small
                   tile>
                <v-icon>mdi-chevron-left</v-icon>&nbsp;вернуться
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
import { isEmpty } from "~/utils/";

export default {
        name: "QrPage",
        middleware: 'auth',
        async asyncData({ store }){
            const token= store.getters["profile/token"],
                  res  = {
                      apiUrl: store.getters["settings/env"]("apiUrl"),
                      error: null
                  };
                  
            const params = {
                        url: `${ store.getters["settings/env"]("rpcUrl") }\?d=token`,
                        method: 'POST',
                        processData: false,
                        beforeSend: function(xhr) {
                            if ( isEmpty(token) ){
                                throw {message: "No auth-token"};
                            }
                            xhr.setRequestHeader('Authorization', `Bearer ${ token }`);
                        }
            };
                  
            try {
                res.hash = await $.ajax(params);
            } catch(e){
                console.log('ERR (hash)', e);
                res.error = e;
            }
            console.log(res);
            return res;
        },
        methods: {
            onerror(e){
                this.error = {
                    message: 'No qr-image load',
                    data: e
                };
                this.$forceUpdate();
            }
        },
        computed: {
            qrUrl(){
                if (this.error){
                    return require("~/assets/error-page.png");
                } 
                  
                const uri = `${ window.location.protocol }//${ window.location.host}/#/auth/?mark=${ this.hash }`;
                return `${ this.apiUrl }/barcode?size=877&url=${ encodeURIComponent(uri) }`;
            }
        }
    }
</script>
<style lang="scss" scoped>
    .qr-auth{
        & .v-card__actions{
            justify-content: flex-end;
            padding: 1.5rem;
        }
        & .v-card__text{
            position: relative;
            text-align: center;
            & .v-image{
                margin: 0 auto;
            }
            & .err-msg{
                position: absolute;
                font-size: 1.25rem;
                position: absolute;
                bottom: 1rem;
                right: 1rem;
                padding: 0 1rem;
                text-align: right;
                color: #fff;
                text-shadow: 0 2px 4px rgba(0,0,0,0.16);
                & .small{
                        font-size: 0.9rem;
                }
            }
        }
        &.qr-error{
            .v-card__text{
                padding: 0 !important;
            }
        }
    }
</style>