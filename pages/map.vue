<template>
    <div class="eva-map">
        <div id="map"></div>
        <v-snackbar v-model="snackbar"
                    timeout="-1"
                    light
                    color="yellow lighten-5">
            <div class="title text-uppercase">
                {{ get('gov') }}
            </div>
            <div v-html="info"></div>
            <template v-slot:action="{ attrs }">
                <v-btn text
                       v-bind="attrs"
                       v-on:click="snackbar = false">
                    <v-icon small>mdi-close</v-icon>
                </v-btn>
      </template>
        </v-snackbar>
    </div>
</template>
<script>
import 'ol/ol.css';
const $moment = require("moment");
    
import Map from 'ol/Map.js';
import {OSM, Vector as VectorSource} from 'ol/source';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import View from 'ol/View.js';
import {Control, defaults as defaultControls} from 'ol/control.js';
import Feature from 'ol/Feature';
import {Point, LineString} from 'ol/geom';
import * as olExtent from 'ol/extent';
import {Style, Stroke, Icon, Text} from 'ol/style';

let map = null;

class BackControl extends Control {
  constructor(opts) {
    const options = opts || {};

    const button = document.createElement('button');
    button.innerHTML = '<i aria-hidden="true" class="v-icon notranslate mdi mdi-chevron-left theme--light"></i>';
    const element = document.createElement('div');
    element.className = 'ol-unselectable ol-control back-control';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', e => {
        $nuxt.$router.go(-1);
    }, false);
  }
}   //BackControl

export default {
    name: 'EvaMap',
    data(){
        return {
            snackbar: false,
            info: ''
        };
    },
    mounted(){
        this.$nextTick(()=>{
            
            const _icoStyle = feature => {
                const props = feature.getProperties();
                const image = new Icon({
                    scale: [0.18, 0.18],
                    src: 'my' === feature.getId() ? '/imgs/flag-red.png' : '/imgs/map-eva-pointer.png'
                });
                if ( props.raw.telemetry ){
                    image.setRotation(props.raw.telemetry.heading * (Math.PI/180))
                } 
                
                
                const style = new Style({ image });
                return style;
            };
            
            const layerIco = new VectorLayer({
                    source: new VectorSource(),
                    style: _icoStyle
            });
            layerIco.set('name', 'ico-layer');
            layerIco.setZIndex(9);
            
            const layerTrip = new VectorLayer({
                    source: new VectorSource(),
                    style: feature => {
                        return new Style({
                            stroke: new Stroke({
                                color: 'rgba(255, 98, 0, 0.9)',
                                lineJoin: "bevel",
                                width: 4
                            })
                        });
                    }
            });
            layerTrip.set('name', 'trip-layer');
            
            const center = this.$store.state.geo.ll;
            map = new Map({
                controls: [new BackControl()],
                layers: [
                    new TileLayer({
                          source: new OSM()
                    }),
                    layerIco,
                    layerTrip
                ],
                target: 'map',
                view: new View({
                    center: [center.lon, center.lat],
                    projection: 'EPSG:4326',
                    zoom: 14,
                    enableRotation: false,
                    constrainResolution: true
                })
            });
            map.once('postrender', e => {
                map.set('ready', 1);
            });
            $(this.$el).append('<div class="ev-info"></div>');
        });
    },
    activated(){
        const center = this.$store.state.geo.ll,
              qr     = this.$route.params.qr;
        if (!qr){
            this.$router.replace({name:"index"});
            return false;
        }
        if (!!qr?.lat){
            center.lat = qr.lat;
            center.lon = qr.lon;
        }
        (async ()=>{
            await this._ready();
            const view = map.getView();
            view.setCenter([center.lon, center.lat]);
            this.drawCoords({id: 'my', center});
            
            $nuxt.api( {
                        type: 'api-call',
                        url: `publicApi?call=lastVehicle&arg.ids=${ qr.vehicleevacid }`
            }).then( res => {
                console.log('last', res);
                if (res.length > 0){
                    this.drawCoords({id: res[0].deviceId, center: res[0]}, true);
                    this.drawTrack();
                } else {
                    $nuxt.msg({text: 'Нет данных о м/н эвакуатора', color: 'warning'});
                }
            }).catch(e =>{
                console.log('ERR (last)', e);
                $nuxt.msg({text: 'Не удается получить сведения о м/н эвакуатора', color: 'warning'});
            });
        })();
    },
    deactivated(){
        this.snackbar = false;
        this.info = '';
        map?.getLayers().forEach( l=>{
            if (l instanceof VectorLayer){
                l.getSource().clear();
            }
        });
    },
    methods: {
        async _ready(){
            return new Promise((resolve, reject)=>{
                const _wai = n => {
                    if (1 == map?.get('ready')){
                        resolve();
                    } else {
                        if (n > 100){
                            reject();
                        } else {
                            setTimeout(()=>{_wai(n++);}, 100);
                        }
                    }
                };
                _wai(0);
            });
        },
        get(q){
            switch(q){
                case "gov":
                    return this.$route.params.qr?.evacoffensejournalVehicleevacidGovnum;
            }
            return false;
        },
        drawCoords(point, fit){
            const layer = map.getLayers().item(1);
            const source= layer.getSource();
            const { center } = point;
            
            var f = source.getFeatureById(point.id);
            if (!!f){
                f.getGeometry().setCoordinates([center.lon, center.lat]);
            } else {
                f = new Feature(new Point([center.lon, center.lat]));
                f.setId(point.id);
                f.setProperties({raw: point});
                source.addFeature(f);
            }
            
            if ( !!fit ){
                const view = map.getView(),
                      bounds = source.getExtent();
                view.setCenter(olExtent.getCenter(bounds));
                view.fit(bounds, {padding: [40, 40, 40, 40]});
            }
        },   //drawCoords
        drawTrack(){
            var coords = '',
                layer = map.getLayers().item(1);
        
            layer.getSource().forEachFeature(f => {
                const _coords = f.getGeometry().getCoordinates();
                if (coords.length > 1){
                    coords += ";";
                }
                coords += `${_coords[0]},${_coords[1]}`;
            });
            
            $.ajax({
                url: `http://router.project-osrm.org/route/v1/car/${ coords }?overview=simplified&geometries=geojson`,
                crossDomain: true
            }).then( res => {
                console.log('router', res);
                layer = map.getLayers().item(2);
                const source = layer.getSource();
                source.clear();
                if ( res.routes?.length > 0 ){
                    source.addFeature(
                        new Feature({
                            geometry: new LineString(res.routes[0].geometry.coordinates),
                        })
                    );
                    const d = $moment.duration(res.routes[0].duration*1000*2);
                    this.info = `дистанция: ${Number(res.routes[0].distance/1000).toFixed(2)} км<br />время: ${((d.hours() > 0) ? d.hours() + ' ч. ' : '') + d.minutes() + ' мин.'}`;
                    this.snackbar = true;
                }
                console.log('trip source', source);
            }).catch( e => {
                console.log('ERR (router)', e);
            });
        }
    }
}
</script>
<style lang="scss">
    .eva-map{
        width: 100%;
        height: 100%;
        & #map{
            width: 100%;
            height: 100%;
        }
    }
    .back-control{
        top: 1rem;
        left: 1rem;
    }
</style>