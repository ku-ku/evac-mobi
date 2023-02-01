globalThis.WebSocket = require("websocket").w3cwebsocket;
import { connect, JSONCodec } from '../node_modules/nats.ws/lib/src/mod.js';
import { isEmpty } from "~/utils/";

/**
 * 
 * @type Object - nats connection (see msg)
 */
var nats = null,
    codec= JSONCodec();

function getDate(date){
    return {
        "@class": "ru.kih.sql.Parameter",
        "value": date.toISOString(),
        "type": "datetime"
    };
}   //getDate

function prepareParams(params) {
    const res = {};
    for (var i = 0, size = params.length; i < size; i++) {
        var { id, type, value } = params[i],
            mimeType;

        if (/^(date)+/.test(type) ){
            value = new Date(value).toISOString();
        } else if (type === 'blob') {
            mimeType = value.mimeType;
            value = value.value;
        }

        const description = {
            "@class": "ru.kih.sql.Parameter",
            "value": value,
            "type": type
        };

        if (type === 'blob') {
            Object.assign(description, { mimeType });
        }
        res[id] = description;
    }
    return res;
}   //getDate

const http = options => {
    const getts = $nuxt.$store.getters;
    const env = getts["settings/env"](),
          token = getts["profile/token"];
    
    if ( isEmpty(options.auth) ) {
        if ( !isEmpty(token) ){
            options.auth = "Bearer " + token;
        }
    }
    
    const now = new Date();
    const defaultContext = {
        dateBegin: getDate(now),
        dateWork: getDate(now),
        dateEnd: getDate(now)
    };

    var params = {
        dataType: 'json',
        method: 'POST',
        contentType: 'application/json;charset=utf-8'
    };

    if ( !isEmpty(options.auth) ) {
        params.beforeSend = function(xhr) {
            xhr.setRequestHeader('Authorization', options.auth);
        };
    }

    switch (options.type) {
        case 'api-call':
            params = Object.assign(params, options);
            params.url = env.apiUrl + options.url;
            delete params.type;
            break;
        case 'auth':
            params.url = env.rpcUrl + '?d=jsonRpc';
            params.data = {
                method: 'web.AuthFunctions.getCurrentUserCredential',
                jsonrpc: '2.0'
            };
            break;
        case 'pre-auth':
            delete params.dataType;
            delete params.contentType;
            options.auth = false; //reset (don`t sending)
            params.url = env.rpcUrl + '?d=token';
            params.processData = false;
            params.async = false;
            params.timeout = 10000;
            params.headers = {
                "X-Mark-IV": options.mark
            };
            break;
        case 'core-read':
            params.url = env.rpcUrl + '?d=jsonRpc';
            params.data = {
                    method: 'ru.kih.sin.api2.Core.read',
                    params: [{
                            query: options.query,
                            context: options.context || defaultContext
                    }],
                    jsonrpc: '2.0'
                };
            break;
        case 'core-create':
        case 'core-update':
            params.url = env.rpcUrl + '?d=jsonRpc';
            params.data = {
                    method: 'ru.kih.sin.api2.Core.create',
                    params: [{
                        query: options.query,
                        context: options.context || defaultContext,
                        params: prepareParams(options.params),
                        offset: 0,
                        count: -1
                    }],
                    jsonrpc: '2.0'
                };
            if ('core-update' === options.type){
                params.data.method = 'ru.kih.sin.api2.Core.update';
            }
            break;
        case 'logout':
            params.url = env.rpcUrl + '?d=jsonRpc';
            params.data = {
                    method: 'web.Users.logout',
                    jsonrpc: '2.0'
            };
            break;
    }   //switch
    
    if ( 
            (!!params.data) 
         && (typeof params.data === 'object')
       ){
        params.data = JSON.stringify(params.data);
    }
    
    return $.ajax(params);
};   //http

/**
 * 
 * @param {Object} msg
 * @returns {Promise}
 */
const msg = async () => {
    if ( !nats ){
        var uri = {...$nuxt.$store.getters["settings/env"]("natsWs")};
        try {
            nats = await connect(uri);
        } catch(e){
            console.log('ERR (nats-connect)', e);
            reject(e);
        }
    }
    return nats;
};

export {
    http,
    msg,
    codec
};