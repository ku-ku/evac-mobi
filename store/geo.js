import geo from '~/utils/geo';

import { 
    boundingExtent,
    containsCoordinate,
    getCenter
} from 'ol/extent';

const GEO_API_URL = 'http://api.sypexgeo.net/json/';

export const state = ()=>({
    ll: {
        fine: false,    //false by geo-ip | true-by GPS
        lat: 45.035470, //Krd-center (city-sq)
        lon: 38.975313
    },
    bounds: null,
    addr: null,         //Object address (see utils/geo->addr)
    last: new Date()
});

export const mutations = {
    setPos(state, payload = {}) {
        state.ll = payload;
        state.last = new Date();
        state.addr = null;
    },
    set(state, payload) {
        Object.keys(payload).map( k => {
            state[k] = payload[k];
        });
    }
};

export const actions = {
    addr(store){
        return new Promise((resolve, reject)=>{
            geo.addr(store.state.ll).then( data => {
                store.commit('set', {addr: data});
                resolve();
            }).catch( e => {
                console.log('ERR (addr)', e);
                resolve();
            } );
        });
    },
    bounds(store){
        return new Promise((resolve, reject)=>{
            if (!!store.state.bounds){
                resolve(store.state.bounds);
                return;
            }
            const opts = {
                type: "api-call",
                method: "GET",
                url: "/v1/routes/getbounds?language=ru"
            };        
            (async () => {
                try {
                    const resp = await $nuxt.api(opts);
                    if (!!resp.error) {
                        throw resp.error;
                    }
                    store.commit("set", {bounds: resp});
                    resolve(resp);
                } catch(e){
                    console.log('ERR (bounds)', e);
                    reject(e);
                }
            })();
        });
    },  //bounds
    current(store){
        var ll = {};

        const p = (resolve, reject) => {
            const _by_bounds = async () => {
                try {
                    await store.dispatch("branding/read", null, {root: true});
                    const { rootGetters } = store;
                    ll = {
                        fine: false,
                        lat: rootGetters["branding/get"]("brand.map.lat"),
                        lon: rootGetters["branding/get"]("brand.map.lon")
                    };
                    store.commit('set', {pos: ll});
                    await store.dispatch('addr');
                    resolve(ll);
                } catch(e){
                    console.log('ERR (by bounds)', e);
                    reject(e);
                }
            };  //_by_bounds
            
            const _by_ip = async ()=>{
                $.ajax({
                    url: GEO_API_URL,
                    crossDomain: true,
                    method: 'GET',
                    timeout: 10000
                }).then( async data => {
                    if (!!data.error){
                        throw data.error;
                    }
                    if (!!data.city){
                        ll = {
                            fine: false,
                            lat: data.city.lat,
                            lon: data.city.lon
                        };
                    } else {
                        throw {message: 'no geo-ip data'};
                    }
                    store.commit('setPos', ll);
                    await store.dispatch('addr');
                    resolve(ll);
                }).catch( e => {
                    console.log('ERR (by ip)', e);
                    _by_bounds();
                });
            };  //_by_ip
            
            if (!!navigator.geolocation){
                var hTm = setTimeout(_by_ip, 5050);
                navigator.geolocation.getCurrentPosition(async pos => {
                        ll = {
                            fine: true,
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude
                        };
                        clearTimeout(hTm);
                        store.commit('setPos', ll);
                        await store.dispatch('addr');
                        resolve(ll);
                    },
                    function(err){
                        clearTimeout(hTm);
                        console.log('GEO ERR by geolocation:', err);
                        _by_ip();
                    },
                    {maximumAge: 180000, timeout: 5000, enableHighAccuracy: true}
                );
            } else {
                _by_ip();
            }
        };

        return new Promise(p);
    }
};

export const getters = {
    distance: state => ll => {
            return geo.distance(state.ll, ll);
    },
    city: state => {
        if ((!!state.addr)&&(state.addr.address)){
            const a = state.addr.address;
            if (!!a.city){
                return (a.city === "object") ? a.city.name : a.city;
            } else if (!!a.village){
                return (typeof a.village === "object") ? a.village.name : a.village;
            } else if (!!a.county){
                return (typeof a.county === "object") ? a.county.name : a.county;
            }
            return '';
        }
        return '';
    },
    bounds: state => state.bounds,
    /**
     * Get a bounded center
     * @param {Object} state
     * @returns {Object} {lon, lat} - coord center of bounds
     */
    center: state => {
        var ll = state.ll;
        if (!!state.bounds){
            const extent = boundingExtent([[state.bounds.minLon, state.bounds.minLat], [state.bounds.maxLon, state.bounds.maxLat]]);
            console.log('extent', extent, ll);
            if ( containsCoordinate(extent, [ll.lon, ll.lat]) ){
                const center = getCenter(extent);
                ll.lon = center[0];
                ll.lat = center[1];
            }
        }
        return ll;
    },
    is: state => q => {
        switch(q){
            case "fine":
                return state.ll?.fine;
        }
        return false;
    }
};
