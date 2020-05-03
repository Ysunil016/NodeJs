// http://192.168.1.101:8099/styles/msis/{z}/{x}/{y}.png
var map_tool = null;
var tfgMapInstance = null;
let tileLayerInstance = null;
const Coordinate = require('coordinates-converter');
const geolib = require('geolib');
const properties = require('../../data/Properties');
require('leaflet-mouse-position');
require('../../assets/js/tactical/leaflet-mapbox-gl');
require('../../assets/js/tactical/Leaflet.PolylineMeasure');


function getLeafletMap() {
    const map = L.map('tactical_map', {
        zoomControl: false
    }).setView([20.05, 79.89], 5).setMaxZoom(15).setMinZoom(4);
       map.scrollWheelZoom.disable();
       map.dragging.disable();
       map.doubleClickZoom.disable();
      
      tileLayerInstance = bindTileServerToMap(map);
        
    // L.control.scale ({maxWidth:240, metric:false, imperial:false, position: 'bottomleft'}).addTo(map);
    // L.control.polylineMeasure({position:'topleft', unit:'nauticalmiles', showBearings:true, clearMeasurementsOnStop: false, showClearControl: true, showUnitControl: true}).addTo(map);

    map_tool = map;
    return map;
}

function getGridLayerTiles(map){
    var tiles = new L.GridLayer();
    tiles.createTile = function(coords) {
    var tile = L.DomUtil.create('canvas', 'leaflet-tile');
    var ctx = tile.getContext('2d');
    var size = this.getTileSize()
    tile.width =  size.x
    tile.height = size.y
    
    // calculate projection coordinates of top left tile pixel
    var nwPoint = coords.scaleBy(size)
    
    // calculate geographic coordinates of top left tile pixel
    var nw = map.unproject(nwPoint, coords.z)
    
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, size.x,15);
    ctx.fillStyle = 'white';
    // ctx.fillText('x: ' + coords.x + ', y: ' + coords.y + ', zoom: ' + coords.z, 20, 20);
    var lat = nw.lat;
    var lng = nw.lng;
    var lat_dir = 'N';
    var lng_dir = 'E';
    if (lat < 0)
        lat_dir = 'S';
    if (lng < 0)
        lng_dir = 'W';

    lat = geolib.decimalToSexagesimal(lat);
    lng = geolib.decimalToSexagesimal(lng);
    ctx.fillText(lat +" "+lat_dir+' / ' + lng+" "+lng_dir, 5, 10);
    ctx.strokeStyle = '#002D3E';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size.x-1, 0);
    ctx.lineTo(size.x-1, size.y-1);
    ctx.lineTo(0, size.y-1);
    ctx.closePath();
    ctx.stroke();
    return tile;
}
return tiles;
}

function bindTileServerToMap(map){
    var mapServerIP = properties.mapServerIP;
    tileLayerInstance = L.mapboxGL({style: 'http://'+mapServerIP+'/styles/linktmap/style.json',accessToken: 'no-token'}).addTo(map);
    return tileLayerInstance;
}

function getTileLayerInstance(){
    return tileLayerInstance;
}

function getMap() {
    return map_tool;
}

function getTFGMAPView() {

    const map = L.map('con_tfg_map').setView([20.05, 79.89], 8);

    L.mapboxGL({
        style: 'http://172.16.43.233:10001/styles/linktmap/style.json',
        accessToken: 'no-token'
    }).addTo(map);

    // L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    // maxZoom: 18,
    // id: 'mapbox.light',
    // accessToken: 'pk.eyJ1Ijoic3VuaWwwMTYiLCJhIjoiY2p0azh4dGxoMDkwejQzcTNhc2I5enFoOCJ9.QvzpRwYLcGl4hW9xtzi95w'
    // }).addTo(map);

    tfgMapInstance = map;
    return map;
}


function getTFGMapInstance() {
    // return tfgMapInstance;
}


module.exports = {
    getLeafletMap,
    getTFGMAPView,
    getMap,
    getTFGMapInstance,
    getGridLayerTiles,
    getTileLayerInstance,
    bindTileServerToMap
}

// http://192.168.1.101:8099/styles/msis/{z}/{x}/{y}.png



function replaceQuotes(str, find, replace) {
    return (str.replace(new RegExp(find, 'g'), replace));
}