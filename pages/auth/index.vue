<template>
    <v-row class="ev-profile fill-height" justify="center" align="center">
        <v-col cols="11" sm="6">
            <v-form v-on:submit.stop.prevent="onauth" 
                    action="#" 
                    ref="form"
                    v-model="valid">
                <v-card class="elevation-3">
                    <v-card-title>
                        <div class="form-icon">
                            <v-icon :color="has('user') ? 'primary': 'default'">
                                {{has('user')?'mdi-account':'mdi-account-lock'}}
                            </v-icon>
                        </div>
                        <div class="form-title" v-html="title"></div>
                    </v-card-title>
                    <v-card-text>
                        <v-text-field
                            label="Логин"
                            name="login"
                            v-model="user.u"
                            autofocus
                            required>
                            <v-icon slot="prepend" small>mdi-account</v-icon>
                        </v-text-field>
                        <v-text-field
                            label="Пароль"
                            name="p"
                            type="password"
                            v-model="user.p">
                            <v-icon slot="prepend" small>mdi-asterisk</v-icon>
                        </v-text-field>
                        <v-alert color="warning" dark class="my-5" v-if="has('error')">
                            <div v-html="error"></div>
                        </v-alert>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn type="submit" 
                               tile
                               :loading="pending"
                               dark 
                               :color="has('user') ? 'primary' : 'red darken-4'" >
                            <template v-if="has('user')">
                                <v-icon>mdi-check-circle-outline</v-icon>&nbsp;ok
                            </template>
                            <template v-else>
                                Войти
                            </template>
                        </v-btn>
                    </v-card-actions>
                    <v-footer>
                        <v-spacer />
                        <span v-html="server"></span>
                    </v-footer>
                </v-card>
            </v-form>
        </v-col>
    </v-row>
</template>

<script>
import { isEmpty } from "~/utils/";
import EvaLinkStatus from "~/components/EvaLinkStatus";

const USER_DEFS = {
    id: null,
    title: '',  //user title
    u: '',
    p: ''
};

export default {
    name: 'SignInPage',
    layout: 'empty',
    fetchOnServer: false,
    components: {
        EvaLinkStatus
    },
    async asyncData({ store, query }){
        
        var preauth = false;
        
        try {
            preauth = await store.dispatch("profile/preauth", query.mark);
        } catch(e) {
            console.log('ERR (preauth)', e);
        }
        return {
            preauth
        };
    },
    data() {
        return {
            valid: false,
            pending: false,
            user: {id: null, u: null, p: null, tenant: null},
            error: ''
        };
    },
    head(){
        return {
            title: 'Авторизация'
        };
    },
    mounted(){
        if (this.preauth){
            this.user = this.$store.state.profile.subject;
            setTimeout( () => {
                    this.$router.replace({name: 'index'});
            }, 300);
        }
    },
    computed: {
        title(){
            if ( this.has('user') ){
                return `${ this.user.title||''}<div class="org-title">${ this.user.tenant }</div>`;
            }
            return this.$store.getters["branding/get"]("brand.web.system.name");
        },
        server(){
            return this.$store.getters["branding/get"]("brand.server.name");
        }
    },
    methods: {
        has(q) {
            switch(q){
                case 'user':
                    return !isEmpty(this.user.id); 
                case 'error':
                    return !isEmpty(this.error); 
            }
            return false;
        },
        async onauth(){
            const {u, p} = this.user;
            if (!this.$refs["form"].validate()) {
                this.error = 'Для входа необходимо ввести Ваши e-mail и пароль';
                $('input[name="u"]').trigger('focus');
                return false;
            }
            this.error = '';
            this.pending = true;
            try {
                await this.$store.dispatch('profile/logout');
                const res = await this.$store.dispatch('profile/login', this.user);
                
                this.user.title = res.title;
                this.user.tenant = res.tenants[res.tenantId].title || '';
                this.user.id = res.id;
                setTimeout( () => {
                    this.$router.replace({name: 'index'});
                }, 2000);
            } catch(e) {
                console.log('ERR (login)', e);
                this.error = `Логин или пароль неверный<div class="small">${ e.responseText || e.message }<br />${e.statusText||''}</div>`;
            } finally {
                this.pending = false;
            }
            return false;
        }     //onauth
    }   //methods
};
</script>
<style lang="scss">
    .v-alert {
        & .small {
            font-size: 0.75rem;
            line-height: 1.115;
            border-top: 1px solid rgba(255, 255, 255, 0.5);
            margin-top: 0.25rem;
            padding-top: 0.25rem;
        }
    }
</style>    

<style lang="scss" scoped>
    .ev-profile{
        min-height: calc(100vh - 56px);
        align-content: center;
        align-items: center;
        justify-content: center;
        & .v-card {
            &__title{
                text-transform: uppercase;
                font-weight: 300;
                font-size: 1rem;
                word-break: break-word;
                flex-wrap: nowrap;
                line-height: 1.25;
                align-content: center;
                justify-content: center;
                    
                & .v-icon{
                    line-height: 1 !important;
                    margin-right: 1rem;
                    border-radius: 500px;
                    padding: 0.25rem;
                    border: 1px solid #ccc;
                    width: 3rem;
                    text-align: center;
                    height: 3rem;
                }
            }
            &__actions{
                text-align: center;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                & .v-btn{
                    width:14rem;
                    margin-bottom: 1rem;
                }
            }
        }
        & .v-footer{
            font-size: 0.75rem;
        }
    }
</style>
