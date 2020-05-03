const redis = require('redis');
var redisClient = redis.createClient();
let buffer_for_server = [];
const L = require('leaflet');
const geoLib = require('geolib');
const map_layers = {};
const Coordinate = require('coordinates-converter');
var currentlayer = null;
var currentCourseLayer = null;
let showVector = true;
let isOnLayer = null;
var map_refresh_interval = null;
let properties = require('../../data/Properties');
require('leaflet-rotatedmarker');
let iconSize = [24, 24];
let aisIconSize = [24,16];
 

//Exposing Required Functionalities Outside this File.
module.exports = {
    //Checking if Track is Availabe in REDIS ID_ARRAY_STORE
    is_ID_in_ID_ARRAY_STORE: (track_id) => {
        return new Promise(function (resolve, reject) {
            redisClient.hget("ID_Array", track_id, function (err, resp) {
                if (resp) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    },
    //Storing Track in REDIS ID_ARRAY_STORE
    store_ID_in_ID_ARRAY_store: (track_id, trackData) => {
        return new Promise(function (resolve, reject) {
            redisClient.hset("ID_Array", track_id, JSON.stringify(trackData));
            resolve(true);
        });
    },
    //Pushing Fresh Tracks Data to Server_Buffer that tobe Send to Server
    con_client_freshTrack_to_server_buffer: async (track_data) => {
        buffer_for_server = await isTrackAlreadyInBuffer_TEMP(track_data.id, buffer_for_server);
        switch (track_data.header) {
            case "$POWNT":
                var data2Push = 0 + "," + track_data.id + "," + track_data.category + "," + track_data.source + "," + track_data.course + "," + track_data.speed + "," + track_data.latitude + "," + track_data.longitude + "," + track_data.height_depth + "," + track_data.call_sign + "," + track_data.date + "," + track_data.time;
                break;
            case "$PRTRK":
                var data2Push = 1 + "," + track_data.id + "," + track_data.category + "," + track_data.rep_unit + "," + track_data.link_track_number + "," + track_data.identity + "," + track_data.source + "," + track_data.track_label + "," + track_data.course + "," + track_data.speed + "," + track_data.latitude + "," + track_data.longitude + "," + track_data.height_depth + "," + track_data.date + "," + track_data.time;
                break;
        }
        //String to be Push in Server Buffer for Optimization
        //Single Track Structure "1,id,rep_unit,lat,long"
        //["1,id","1,id","2,id"];

        buffer_for_server.push(data2Push);
    },
    //Pushing Updated Tracks Data to Server_Buffer that tobe Send to Server    
    con_client_updateTrack_to_server_buffer: async (track_data) => {
        buffer_for_server = await isTrackAlreadyInBuffer(track_data.id, buffer_for_server);
        switch (track_data.header) {
            case "$POWNT":
                var data2Push = 2 + "," + track_data.id + "," + track_data.course + "," + track_data.speed + "," + track_data.latitude + "," + track_data.longitude + "," + track_data.height_depth + "," + track_data.date + "," + track_data.time;
                break;
            case "$PRTRK":
                var data2Push = 3 + "," + track_data.id + "," + track_data.course + "," + track_data.speed + "," + track_data.latitude + "," + track_data.longitude + "," + track_data.height_depth + "," + track_data.date + "," + track_data.time;
                break;
        }
        //String to be Push in Server Buffer for Optimization
        //Single Track Structure "1,id,rep_unit,lat,long"
        //["1,id","1,id","2,id"];

        buffer_for_server.push(data2Push);
    },
    //Retreving Sever_Buffer    
    get_con_client_to_server_buffer: () => {
        return buffer_for_server;
    },
    //Retreving All Tracks from ID_ARRAY_STORE        
    get_all_tracks_from_ID_Array_redis: () => {
        return new Promise((resolve, reject) => {
            redisClient.hgetall("ID_Array", (err, resp) => {
                resp = JSON.parse(resp);
                var allTracks = [];
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    allTracks.push(resp[track_keys[i]]);
                }
                resolve(allTracks);
            })
        })

    },
    //Flushing Server_Buffer    
    flush_track_server_buffer: () => {
        buffer_for_server = [];
    },
    //Storing Tracks Data to Redis Tactical Map Platform
    store_track_in_tacticalMapPF_store: (track_id, trackData) => {
        return new Promise(async function (resolve, reject) {
            // var latitude = await replaceQuotes(trackData.latitude, ":", " ");
            // var longitude = await replaceQuotes(trackData.longitude, ":", " ");
            // const coordWithSpaces = new Coordinate(latitude + " " + longitude);
            // var latLong = coordWithSpaces.toDd();
             var latLong = [trackData.latitude,trackData.longitude];
            trackData.latLong = latLong;         
            trackData.timestamp = Date.now();
            
               if(properties.OWN_SHIP_POSITION){
                var {latitude,longitude} = properties.OWN_SHIP_POSITION;
                var latLongOwn = [latitude,longitude]
                var rangeBearing = linkTrackHandler.calculateRangeBearing(latLongOwn[0],latLongOwn[1],latLong[0],latLong[1]);
                trackData.range = ((rangeBearing.SRange)/1852).toFixed(2);
                trackData.bearing = (rangeBearing.SBearing).toFixed(2);
             }



            redisClient.hset("MAP_DATA_ID_Array_PF", track_id, JSON.stringify(trackData));
            resolve(true);
        });
    },
    //Storing Tracks Data to Redis Tactical Map Force Unit    
    store_track_in_tacticalMapNetUnit_store: (track_id, trackData) => {
        return new Promise(async function (resolve, reject) {
            // var latitude = await replaceQuotes(trackData.latitude, ":", " ");
            // var longitude = await replaceQuotes(trackData.longitude, ":", " ");
            // const coordWithSpaces = new Coordinate(latitude + " " + longitude);
            var latLong = [trackData.latitude,trackData.longitude];
            trackData.latLong = latLong;            
            trackData.timestamp = Date.now();

            if(properties.OWN_SHIP_POSITION){
               var {latitude,longitude} = properties.OWN_SHIP_POSITION;
                var latLongOwn = [latitude,longitude]
                var rangeBearing = linkTrackHandler.calculateRangeBearing(latLongOwn[0],latLongOwn[1],latLong[0],latLong[1]);
                trackData.range = ((rangeBearing.SRange)/1852).toFixed(2);
                trackData.bearing = (rangeBearing.SBearing).toFixed(2);
             }

            redisClient.hset("MAP_DATA_ID_Array_NET_UNIT", track_id, JSON.stringify(trackData));
            resolve(true);
        });
    },
    //Storing Tracks Data to Redis Tactical Map COP        
    store_track_in_tacticalMapCOP_store: (track_id, trackData) => {
        return new Promise(async (resolve, reject) => {
            // var latitude = await replaceQuotes(trackData.latitude, ":", " ");
            // var longitude = await replaceQuotes(trackData.longitude, ":", " ");
            // const coordWithSpaces = new Coordinate(latitude + " " + longitude);
            // var latLong = coordWithSpaces.toDd();
          
            var latLong = [trackData.latitude,trackData.longitude];
            trackData.latLong = latLong;
            trackData.timestamp = Date.now();

            if(properties.OWN_SHIP_POSITION){
              var {latitude,longitude} = properties.OWN_SHIP_POSITION;
                var latLongOwn = [latitude,longitude]
                var rangeBearing = linkTrackHandler.calculateRangeBearing(latLongOwn[0],latLongOwn[1],latLong[0],latLong[1]);
                trackData.range = ((rangeBearing.SRange)/1852).toFixed(2);
                trackData.bearing = (rangeBearing.SBearing).toFixed(2);
             }

            redisClient.hset("MAP_DATA_ID_Array_COP", track_id, JSON.stringify(trackData));

            resolve(true);
        })
    },
    //Fetching Track Data for Marker on Layer from Redis ID_ARRAY_STORE
    get_all_map_markers_pf: (map) => {
        return get_all_map_markers_pf(map);
    },
    //Fetching Track Data for Marker on Layer from Redis MAP_DATA_ID_Array_NET_UNIT    
    get_all_map_markers_net_unit: (map) => {
        return get_all_map_markers_net_unit(map);
    },
    //Fetching Track Data for Marker on Layer from Redis MAP_DATA_ID_Array_COP        
    get_all_map_markers_cop: (map) => {
        return get_all_map_markers_cop(map);
    },
    //Flushing Tracks from Redis MAP_DATA_ID_Array_PF
    flush_redis_track_pf: () => {
        new Promise((resolve, reject) => {
            redisClient.del("MAP_DATA_ID_Array_PF", (err, resp) => {
                resolve(true);
            })
        })
    },
    //Dropping Tracks from Redis MAP_DATA_ID_Array_PF
    dropCurrentTrack: async (id) => {
        await dropCurrentTrack(id);
    },
    //Switching MAP Layer for Platform Layer.    
    switchToPF: async (map) => {
        document.getElementById('track_table').style.display = "none";
        document.getElementById('track_list').style.display = "none";        

        await switchToPF(map);
    },
    //Switching MAP Layer for Force Layer.    
    switchToNETUNIT: async (map) => {   
        var track_table = document.getElementById('track_table');
        track_table.style.display = "block";
        track_table.setAttribute('onClick','openTrackDetails(0)');
        document.getElementById('track_table_title').innerText = "Force Table";
        document.getElementById('track_list').style.display = "none";  
        await switchToNETUNIT(map);
    },
    //Switching MAP Layer for COP Layer.
    switchToCOP: async (map) => {
        var track_table = document.getElementById('track_table');
        track_table.style.display = "block";
        track_table.setAttribute('onClick','openTrackDetails(1)');
        document.getElementById('track_table_title').innerText = "COP Table";
        document.getElementById('track_list').style.display = "none";     
        await switchToCOP(map);
    },
    //Fetching Data from Redis MAP_DATA_ID_Array_COP
    get_cop_track_data: () => {
        var cop_data = [];
        return new Promise((resolve, reject) => {
            redisClient.hgetall("MAP_DATA_ID_Array_COP", (err, resp) => {
                var markers = [];
                if (resp) {
                    var track_keys = Object.keys(resp);
                    for (var i = 0; i < track_keys.length; i++) {
                        var track_data = JSON.parse(resp[track_keys[i]]);
                        cop_data.push(track_data);
                    }
                    resolve(cop_data);
                }
                resolve([]);
            });

        });


    },
     get_force_track_data: () => {
        var force_data = [];
        return new Promise((resolve, reject) => {
            redisClient.hgetall("MAP_DATA_ID_Array_NET_UNIT", (err, resp) => {
                var markers = [];
                if (resp) {
                    var track_keys = Object.keys(resp);
                    for (var i = 0; i < track_keys.length; i++) {
                        var track_data = JSON.parse(resp[track_keys[i]]);
                        force_data.push(track_data);
                    }
                    resolve(force_data);
                }
                resolve([]);
            });

        });
    },
    showTrackDetailInTote,
    get_lat_lng_Radian,
    showRangeScaleOnMap,
    manageIconScaling,
    calculateRangeBearing,
    drawRangeCircleAroundOwn,
    getRangeBasedOnZoomLevel,
    updateRangeCircle,
    currentVectorLayerVisibility,
    getCourseDialLayer
}

let courseVectorLayer = null;


function getAllCourses() {
    return new Promise((resolve, reject) => {
        redisClient.hgetall("MAP_DATA_ID_Array_PF", (err, resp) => {
            var courseLine = [];
            if (resp) {
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    var track_data = JSON.parse(resp[track_keys[i]]);
                    switch (track_data.header) {
                        case "$PRTRK":
                            var latlngs = [
                                track_data.latLong,
                                [parseInt(random() * 100).toFixed(2), parseInt(random() * 100).toFixed(2)]
                            ];

                            var courseLine_Single = L.polyline(latlngs, {
                                color: '#cc8616'
                            })
                            courseLine.push(courseLine_Single);
                            break;
                    }
                }
            }
            resolve(courseLine);
        });
    });
}

function switchToPF(map) {
    isOnLayer = 0;
    return new Promise(async (resolve, reject) => {

        clearInterval(map_refresh_interval);
        if (currentlayer)
            map.removeLayer(currentlayer);
        if (currentCourseLayer)
            map.removeLayer(currentCourseLayer);
        var markers = await get_all_map_markers_pf(map);
        currentlayer = new L.layerGroup(markers.markers).addTo(map);
        currentCourseLayer = new L.layerGroup(markers.courseMarker);
        if(showVector)
        currentCourseLayer = currentCourseLayer.addTo(map);
        var oldLayer = currentlayer;
        var oldCourseLayer = currentCourseLayer;
        map_refresh_interval = setInterval(async () => {
            markers = await get_all_map_markers_pf(map);
            currentlayer = new L.layerGroup(markers.markers).addTo(map);
            currentCourseLayer = new L.layerGroup(markers.courseMarker);
             if(showVector)
            currentCourseLayer = currentCourseLayer.addTo(map);
            map.removeLayer(oldLayer);
            map.removeLayer(oldCourseLayer);
            oldLayer = currentlayer;
            oldCourseLayer = currentCourseLayer;
        }, 10000);
        resolve(true);
    });
}

function switchToNETUNIT(map) {
    isOnLayer = 1;
    return new Promise(async (resolve, reject) => {
        clearInterval(map_refresh_interval);
        if (currentlayer)
            map.removeLayer(currentlayer);
        if (currentCourseLayer)
            map.removeLayer(currentCourseLayer);

        var markers = await get_all_map_markers_net_unit(map);
        currentlayer =new L.layerGroup(markers.markers).addTo(map);
        currentCourseLayer = new L.layerGroup(markers.courseMarker);
        if(showVector)
        currentCourseLayer = currentCourseLayer.addTo(map);
        var oldLayer = currentlayer;
        var oldCourseLayer = currentCourseLayer;
        map_refresh_interval = setInterval(async () => {
            markers = await get_all_map_markers_net_unit(map);
            currentlayer = new L.layerGroup(markers.markers).addTo(map);
            currentCourseLayer = new L.layerGroup(markers.courseMarker);
             if(showVector)
            currentCourseLayer = currentCourseLayer.addTo(map);
            map.removeLayer(oldLayer);
            map.removeLayer(oldCourseLayer);
            oldLayer = currentlayer;
            oldCourseLayer = currentCourseLayer;
        }, 10000);
        resolve(true);
    });
}

function switchToCOP(map) {
    isOnLayer = 2;
    return new Promise(async (resolve, reject) => {
        clearInterval(map_refresh_interval);
        if (currentlayer)
            map.removeLayer(currentlayer);
        if (currentCourseLayer)
            map.removeLayer(currentCourseLayer);

        var markers = await get_all_map_markers_cop(map);
        currentlayer = L.layerGroup(markers.markers).addTo(map);
        currentCourseLayer = new L.layerGroup(markers.courseMarker).addTo(map);        
        var oldLayer = currentlayer;
        var oldCourseLayer = currentCourseLayer;
        map_refresh_interval = setInterval(async () => {
            markers = await get_all_map_markers_cop(map);
            currentlayer = L.layerGroup(markers.markers).addTo(map);
            currentCourseLayer = new L.layerGroup(markers.courseMarker).addTo(map);           
            map.removeLayer(oldLayer);
             map.removeLayer(oldCourseLayer);
            oldLayer = currentlayer;
            oldCourseLayer = currentCourseLayer;
            
        }, 10000);
        resolve(true);
    });
}

function currentVectorLayerVisibility(map,action){
    switch(action){
        case 0:
            if(currentCourseLayer){
            map.removeLayer(currentCourseLayer);
            showVector = false;            
            }
            break;
        case 1:
            if(currentCourseLayer){
            currentCourseLayer.addTo(map);
            showVector = true;
            }
            break;
    }

}


//Helper Function for Above Expose 
async function get_all_map_markers_pf(map) {
    return new Promise((resolve, reject) => {
        redisClient.hgetall("MAP_DATA_ID_Array_PF", (err, resp) => {
            var markers = [];
            var courseMarker = [];
            var currentZoomLevel = map.getZoom();
            var onToolTip = false;

            if (currentZoomLevel > 9)
                onToolTip = true;

            var trackIcon = L.Icon.extend({
                options: {
                    iconSize: iconSize,
                    className: "track_icon_pf"
                }
            });
            var aisTrackIcon = L.Icon.extend({
                options:{
                    iconSize:aisIconSize,
                    className:"track_icon_pf"
                }
            })
           
            if (resp) {
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    var track_data = JSON.parse(resp[track_keys[i]]);
                    switch (track_data.header) {
                        case "$POWNT":
                            var {
                                id, net_unit, rep_unit_name, category, source, course, speed, call_sign, height_depth, latitude, longitude, latLong
                            } = track_data;
                            var track_icon = new trackIcon({
                                iconUrl: "../assets/img/tracks_images/ownship/ownship.png"
                            });
                            var current_marker = L.marker(latLong, {
                                icon: track_icon,
                                track_data: track_data
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(rep_unit_name, {
                                    permanent: true
                                });
                            speed = speed * 0.51444;
                           var expLatLng = calculateExpectedLatLong(latLong[0],latLong[1],speed*100,parseInt(course));
                            var latlngs = [
                                latLong,
                                expLatLng
                            ];
                            var courseLine_Single = L.polyline(latlngs, {
                                color:'wheat'
                            })
                            courseMarker.push(courseLine_Single);
                            break;
                        case "$PRTRK":
                            var {
                                id, link_track_number, category, identity, source, rep_unit, rep_unit_name, track_label, course, speed, latitude, longitude, latLong,range,bearing
                            } = track_data;
                            var marker_popup = "<div class='track_pop'><span>Label:</span><label>" + track_label + "</label></div><div class='track_pop'><span>Range: </span><label>" + range + " nm</label></div><div class='track_pop'><span>Bearing: </span><label>" + bearing + " deg</label></div>";
                            var track_icon = new trackIcon({
                                iconUrl: "../assets/img/tracks_images/" + identity + "_" + category + ".svg"
                            });
                            var current_marker = L.marker(latLong, {
                                icon: track_icon,
                                track_data: track_data
                            }).bindPopup(marker_popup).on('mouseover', function (e) {
                                this.openPopup();
                            }).on('mouseout', function (e) {
                                this.closePopup();
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(track_label, {
                                    permanent: true
                                });
                           speed = speed * 0.51444;
                           var expLatLng = calculateExpectedLatLong(latLong[0],latLong[1],speed*100,parseInt(course));
                            var latlngs = [
                                latLong,
                                expLatLng
                            ];
                            var courseLine_Single = L.polyline(latlngs, {
                                color:'wheat'
                            })
                            courseMarker.push(courseLine_Single);
                            break;
                        case "$PMTRK":
                            var {id, MMSI, call_sign, ship_type, rep_unit, course, speed, latitude, longitude, latLong,range,bearing} = track_data;
                            var marker_popup = "<div class='track_pop'><span>AIS :</span><label>" + MMSI + "</label></div><div class='track_pop'><span>Range: </span><label>" + range + " nm</label></div><div class='track_pop'><span>Bearing: </span><label>" + bearing + " deg</label></div>";
                              var track_icon = new aisTrackIcon({
                                iconUrl: "../assets/img/tracks_images/AIS/AIS_UW_" + ship_type + ".svg"
                            });
                            var current_marker = L.marker(latLong, {
                                icon: track_icon,
                                track_data: track_data
                            }).bindPopup(marker_popup).on('mouseover', function (e) {
                                this.openPopup();
                            }).on('mouseout', function (e) {
                                this.closePopup();
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(track_label, {
                                    permanent: true
                                });
                            break;
                        case "$PADSB":
                            var {
                                id, flightname, act_dep, est_arv, source, destination, course, true_air_speed, height_depth, latitude, longitude, latLong,range,bearing
                            } = track_data;
                            var marker_popup = "<div class='track_pop'><span>Flight Name:</span><label>" + flightname + "</label></div><div class='track_pop'><span>Range: </span><label>" + range + " nm</label></div><div class='track_pop'><span>Bearing: </span><label>" + bearing + " deg</label></div>";                           
                              var track_icon = new trackIcon({
                                iconUrl: track_icons.ownship_icon
                            });
                            var current_marker = L.marker(latLong, {
                                icon: track_icon,
                                track_data: track_data
                            }).bindPopup(marker_popup).on('mouseover', function (e) {
                                this.openPopup();
                            }).on('mouseout', function (e) {
                                this.closePopup();
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(flightname, {
                                    permanent: true
                                });
                            break;
                    }
                    markers.push(current_marker);
                }
            }
            resolve({
                markers,
                courseMarker
            });
        });
    });
}

function get_all_map_markers_net_unit(map) {
    return new Promise((resolve, reject) => {
        redisClient.hgetall("MAP_DATA_ID_Array_NET_UNIT", (err, resp) => {
            var markers = [];
            var courseMarker = [];
            var currentZoomLevel = map.getZoom();
            var onToolTip = false;

            if (currentZoomLevel > 9)
                onToolTip = true;

            var trackIcon = L.Icon.extend({
                options: {
                    iconSize: iconSize
                }
            });

            if (resp) {
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    var track_data = JSON.parse(resp[track_keys[i]]);
                    var {
                        id,
                        net_unit,
                        rep_unit_name,
                        category,
                        source,
                        course,
                        speed,
                        call_sign,
                        height_depth,
                        latitude,
                        longitude,
                        latLong
                    } = track_data;
                    var marker_popup = "<div class='track_pop'><label>" + rep_unit_name + "</label></div>";
                    var track_icon = new trackIcon({
                        iconUrl: "../assets/img/tracks_images/ownship/ownship.png"
                    });
                    var current_marker = L.marker(latLong, {
                        icon: track_icon,
                        track_data: track_data
                    }).bindPopup(marker_popup).on('mouseover', function (e) {
                        this.openPopup();
                    }).on('mouseout', function (e) {
                        this.closePopup();
                    });
                    current_marker.on('click', function (e) {
                        getTrackDataOnToteArea(e)
                    });
                    speed = speed * 0.51444;
                    var expLatLng = calculateExpectedLatLong(latLong[0],latLong[1],speed*100,parseInt(course));
                    var latlngs = [
                        latLong,
                        expLatLng
                    ];
                    var courseLine_Single = L.polyline(latlngs, {
                        color:'wheat'
                    })
                    courseMarker.push(courseLine_Single);
                    if (onToolTip)
                        current_marker.bindTooltip(rep_unit_name, {
                            permanent: true
                    });
                    markers.push(current_marker);
                }
            }
            resolve({markers,courseMarker});
        });
    });
}

function get_all_map_markers_cop(map) {
    return new Promise((resolve, reject) => {
        redisClient.hgetall("MAP_DATA_ID_Array_COP", (err, resp) => {
            var markers = [];
            var courseMarker = [];            
            var currentZoomLevel = map.getZoom();
            var onToolTip = false;

            if (currentZoomLevel > 9)
                onToolTip = true;

                var trackIcon = L.Icon.extend({
                options: {
                    iconSize: iconSize,
                    className: "track_icon_pf"
                }
            });
            var aisTrackIcon = L.Icon.extend({
                options:{
                    iconSize:aisIconSize,
                    className:"track_icon_pf"
                }
            })

            if (resp) {
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    var track_data = JSON.parse(resp[track_keys[i]]);

                    switch (track_data.header) {
                        case "$POWNT":
                            var {
                                id, net_unit, category, source, course, speed, call_sign, height_depth, latitude, longitude, latLong, rep_unit_name
                            } = track_data;

                            var marker_popup = "<div class='track_pop'><span>Unit:</span><label>" + net_unit + "</label></div><div class='track_pop'><span>Course: </span><label>" + course + "</label></div><div class='track_pop'><span>Speed: </span><label>" + speed + "</label></div>";

                            var track_icon = new trackIcon({
                                iconUrl: "../assets/img/tracks_images/ownship/ownship.png"
                            });
                            var current_marker = L.marker(latLong, {
                                icon: track_icon,
                                track_data: track_data
                            }).bindPopup(marker_popup).on('mouseover', function (e) {
                                this.openPopup();
                            }).on('mouseout', function (e) {
                                this.closePopup();
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(rep_unit_name, {
                                    permanent: true
                                });
                            speed = speed * 0.514444;
                            var expLatLng = calculateExpectedLatLong(latLong[0],latLong[1],speed*100,parseInt(course));
                            var latlngs = [
                                latLong,
                                expLatLng
                            ];
                            var courseLine_Single = L.polyline(latlngs, {
                                color:'wheat'
                            })
                            courseMarker.push(courseLine_Single);
                            break;
                        case "$PRTRK":
                            var {
                                id, link_track_number, category, identity, source, rep_unit, rep_unit_name, track_label, course, speed, latitude, longitude, latLong,range,bearing} = track_data;
                           
                            var marker_popup = "<div class='track_pop'><span>Label:</span><label>" + track_label + "</label></div><div class='track_pop'><span>Range: </span><label>" + range + " nm</label></div><div class='track_pop'><span>Bearing: </span><label>" + bearing + " deg</label></div>";

                            var track_icon = new trackIcon({
                                iconUrl: "../assets/img/tracks_images/" + identity + "_" + category + ".svg"
                            });
                            var current_marker = L.marker(latLong, {
                                icon: track_icon,
                                track_data: track_data
                            }).bindPopup(marker_popup).on('mouseover', function (e) {
                                this.openPopup();
                            }).on('mouseout', function (e) {
                                this.closePopup();
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(track_label, {
                                    permanent: true
                                });
                            speed = speed * 0.514444;
                            var expLatLng = calculateExpectedLatLong(latLong[0],latLong[1],speed*100,parseInt(course));
                            var latlngs = [
                                latLong,
                                expLatLng
                            ];
                            var courseLine_Single = L.polyline(latlngs, {
                                color:'wheat'
                            })
                            courseMarker.push(courseLine_Single);
                            break;

                        case "$PCTRK":
                            var {
                                id, mmsi, ship_type, track_label, rep_unit, course, speed, latitude, longitude, latLong,range,bearing
                            } = track_data;
                            var marker_popup = "<div class='track_pop'><span>MSIS:</span><label>" + mmsi + "</label></div><div class='track_pop'><span>Range: </span><label>" + range + " nm</label></div><div class='track_pop'><span>Bearing: </span><label>" + bearing + " deg</label></div>";
                          
                            // console.log(course);
                            // var track_icon = L.divIcon({html:"<div style='transform:rotate("+course+"deg)'></div>",iconUrl:"../assets/img/tracks_images/AIS/AIS_UW_"+ship_type+".svg"});
                            // var track_icon = L.icon({iconUrl:"../assets/img/tracks_images/AIS/AIS_UW_"+ship_type+".svg",iconSize:[25,25],});
                            var track_icon = new aisTrackIcon({
                                iconUrl: "../assets/img/tracks_images/AIS/AIS_UW_" + ship_type + ".svg"
                            });

                            var current_marker = L.marker(latLong, {
                                icon: track_icon,
                                track_data,
                                rotationAngle: (course - 90)
                            }).bindPopup(marker_popup).on('mouseover', function (e) {
                                this.openPopup();
                            }).on('mouseout', function (e) {
                                this.closePopup();
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(track_label, {
                                    permanent: true
                                });
                            break;

                        case "$PADSB":
                            var {
                                id, flight_name, actual_departure, estimated_arrival, source, destination, rep_unit, course, true_air_speed, height_depth, latitude, longitude, latLon
                            } = track_data;
                            //    var marker_popup = "<table class='table table-bordered'><tr><td>Flight Name</td><td>"+flight_name+"</td></tr><tr><td>Actual Departure</td><td>"+actual_departure+"</td></tr><tr><td>Estimated Arrival</td><td>"+estimated_arrival+"</td></tr><tr><td>Source</td><td>"+source+"</td></tr><tr><td>Destination</td><td>"+destination+"</td></tr><tr><td>True Air Speed</td><td>"+true_air_speed+"</td></tr><tr><td>Course</td><td>"+course+" (Deg.)"+"</td></tr><tr><td>Reporting Unit</td><td>"+rep_unit+"</td></tr><tr><td>Latitude</td><td>"+latitude+"</td></tr><tr><td>Longitude</td><td>"+longitude+"</td></tr>";
                            var marker_popup = "<div class='track_pop'><span>Label:</span><label>" + flight_name + "</label></div><div class='track_pop'><span>Source:</span><label>" + source + "</label></div><div class='track_pop'><span>COG/SOG</span><label>" + course + " / " + speed + "</label></div><div class='track_pop'><span>Lat/Lng</span><label>" + latitude + " / " + longitude + "</label></div>";

                            var track_icon = new trackIcon({
                                iconUrl: "../assets/img/tracks_images/ADS.png"
                            });
                            var current_marker = L.marker(track_data.latLong, {
                                icon: track_icon,
                                track_data: track_data
                            }).bindPopup(marker_popup).on('mouseover', function (e) {
                                this.openPopup();
                            }).on('mouseout', function (e) {
                                this.closePopup();
                            });
                            current_marker.on('click', function (e) {
                                getTrackDataOnToteArea(e)
                            });
                            if (onToolTip)
                                current_marker.bindTooltip(flight_name, {
                                    permanent: true
                                });
                            break;
                    }
                    markers.push(current_marker);
                }
            }
            resolve({markers,courseMarker});
        });
    });
}

function isTrackAlreadyInBuffer(idRec, tracks) {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < tracks.length; i++) {
            var splitTrack = tracks[i].split(",");
            if (splitTrack[1] == idRec && (splitTrack[0] != 1) && ((splitTrack[0] != 0)))
                tracks.splice(i, 1);
        }
        resolve(tracks);
    })
}

function replaceQuotes(str, find, replace) {
    return new Promise((resolve, reject) => {
        resolve(str.replace(new RegExp(find, 'g'), replace));
    });
}
async function dropCurrentTrack(id) {
    return new Promise((resolve, reject) => {
        redisClient.hdel("MAP_DATA_ID_Array_PF", id, (err, reply) => {

            resolve(true);
        });
    });
}

async function getTrackDataOnToteArea(e) {
    var track_data = (e.sourceTarget.options.track_data);
    if(track_data.link_track_number)
    document.getElementById('tote_entity_selected').innerText = track_data.link_track_number;
    else
    document.getElementById('tote_entity_selected').innerText = "NA";
    if(track_data.source)
    document.getElementById('entity_source').innerText = track_data.source;
    else
    document.getElementById('entity_source').innerText = "Unknown";
    
    
    var trackToteArea = $('#track_tote_area_template').html()
    var trackToteAreaTemplate = Handlebars.compile(trackToteArea)
    $('.track_tote_area').html(trackToteAreaTemplate(track_data))

}




//Temp
function isTrackAlreadyInBuffer_TEMP(idRec, tracks) {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < tracks.length; i++) {
            var splitTrack = tracks[i].split(",");
            if (splitTrack[1] == idRec)
                tracks.splice(i, 1);
        }
        resolve(tracks);
    })
}

function showRangeScaleOnMap(currentZoomRange) {
    switch (currentZoomRange) {
        case 4:
            document.getElementById('current_range_naut').innerText = '2048 nm';
            break;
        case 5:
            document.getElementById('current_range_naut').innerText = '1024 nm';
            break;
        case 6:
            document.getElementById('current_range_naut').innerText = '512 nm';
            break;
        case 7:
            document.getElementById('current_range_naut').innerText = '256 nm';
            break;
        case 8:
            document.getElementById('current_range_naut').innerText = '128 nm';
            break;
        case 9:
            document.getElementById('current_range_naut').innerText = '64 nm';
            break;
        case 10:
            document.getElementById('current_range_naut').innerText = '32 nm';
            break;
        case 11:
            document.getElementById('current_range_naut').innerText = '16 nm';
            break;
        case 12:
            document.getElementById('current_range_naut').innerText = '8 nm';
            break;
        case 13:
            document.getElementById('current_range_naut').innerText = '4 nm';
            break;
        case 14:
            document.getElementById('current_range_naut').innerText = '2 nm';
            break;
        case 15:
            document.getElementById('current_range_naut').innerText = '1 nm';
            break;
    }

}

async function manageIconScaling(map, zoomLevel,level) {
    clearInterval(map_refresh_interval);
    if(level==1){
    iconSize = [24, 24];
    aisIconSize = [24,16];
    }else{
    iconSize = [16, 16];
    aisIconSize = [12,8];    
    }
        switch (isOnLayer) {
            case 0:
                await switchToPF(map);
                break;
            case 1:
                await switchToNETUNIT(map);
                break;
            case 2:
                await switchToCOP(map);
                break;
        }

}


const R_MAJOR = 6378137;
const DEG_TO_RAD = 0.0174532925199;
const RAD_TO_DEG = 57.29577951308;

function calculateExpectedLatLong(origin_lat,origin_long,range,bearing){
    var {asin,atan2,cos,sin} = Math;
 
    let distanceFactor = range/R_MAJOR;
    let lat_rad = origin_lat*DEG_TO_RAD;
    let lng_rad = origin_long*DEG_TO_RAD;
    bearing = bearing*DEG_TO_RAD;

    var lat = asin(sin(lat_rad)*cos(distanceFactor)+((cos(lat_rad)*sin(distanceFactor)*cos(bearing))));
    var lng = lng_rad + atan2(sin(bearing)*sin(distanceFactor)*cos(lat_rad),cos(distanceFactor)-sin(lat_rad)*sin(lat));
    lat = lat*RAD_TO_DEG;
    lng = lng*RAD_TO_DEG;

    return [lat,lng];
}

function calculateRangeBearing(origin_lat,origin_long,des_lat,des_long){
    let {sin,cos,atan2,sqrt} = Math;
    
    var deltaLat = (des_lat-origin_lat)*DEG_TO_RAD;
    var deltaLong = (des_long-origin_long)*DEG_TO_RAD;
    des_lat = des_lat*DEG_TO_RAD;
    des_long = des_long*DEG_TO_RAD;
    origin_lat = origin_lat*DEG_TO_RAD;
    origin_long =origin_long*DEG_TO_RAD;

    let tempA = sin(deltaLat/2)*sin(deltaLat/2)+cos(origin_lat)*cos(des_lat)*sin(deltaLong/2)*sin(deltaLong/2);
    let SRange = (2*atan2(sqrt(tempA),sqrt(1-tempA)))*R_MAJOR;

    let tempB = atan2(sin(deltaLong)*cos(des_lat),cos(origin_lat)*sin(des_lat)-sin(origin_lat)*cos(des_lat)*cos(deltaLong));
    let SBearing = tempB*RAD_TO_DEG;
    SBearing = (SBearing+360)%360;

    return { SRange,SBearing};

}

function getRangeBasedOnZoomLevel(zoomLevel){
    switch(zoomLevel){
        case 4:
        return 2048*1.85*1000;
        case 5:
        return 1024*1.85*1000;
        case 6:
        return 512*1.85*1000;
        case 7:
        return 256*1.85*1000;
        case 8:
        return 128 *1.85*1000;
        case 9:
        return 64*1.85*1000;
        case 10:
        return 32*1.85*1000;
        case 11:
        return 16*1.85*1000;
        case 12:
        return 8*1.85*1000
        case 13:
        return 4*1.85*1000
        case 14:
        return 2*1.85*1000
        case 15:
        return 1*1.85*1000
    }
}

var Range1 = null;
var Range2 = null;
var Range3 = null;
var Range4 = null;
async function drawRangeCircleAroundOwn(map,status,zoomLevel){
    if(status==0){
    var track_data = properties.OWN_SHIP_POSITION;
    if(track_data){
    var degreeConversion = await get_lat_lng_Radian(track_data);
    var maxRangeRadius = (getRangeBasedOnZoomLevel(zoomLevel))/4;
    Range1 = L.circle(degreeConversion, maxRangeRadius, {
        color: 'gray',
        weight:1,
        fill: false
    }).bindTooltip(Math.ceil(((maxRangeRadius)/1852)).toFixed(0)+" nm",{
         permanent: true,
        className: 'rangeCircleToolTipOne'
    }).addTo(map);
    Range2 = L.circle(degreeConversion, (maxRangeRadius*2), {
        color: 'gray',
        weight:1,        
        fill: false
    }).bindTooltip(Math.ceil(((maxRangeRadius*2)/1852)).toFixed(0)+" nm",{
         permanent: true,
        className: 'rangeCircleToolTipTwo'
    }).addTo(map);
    Range3 = L.circle(degreeConversion, (maxRangeRadius*3), {
        weight:1,
        color: 'gray',
        fill: false
    }).bindTooltip(Math.ceil(((maxRangeRadius*3)/1852)).toFixed(0)+" nm",{
         permanent: true,
        className: 'rangeCircleToolTipThree'
    }).addTo(map);
    Range4 = L.circle(degreeConversion, (maxRangeRadius*4), {
        weight:1,
        color: 'gray',
        fill: false
    }).bindTooltip(Math.ceil(((maxRangeRadius*4)/1852)).toFixed(0)+" nm",{
         permanent: true,
        className: 'rangeCircleToolTipFour'
    }).addTo(map);
    }
    }else if(status==1){
        if(Range1){
            Range1.remove();
            Range2.remove();
            Range3.remove();
            Range4.remove();
        }
    }
}
function getRangeInstances(){
    return {
        Range1,
        Range2,
        Range3,
        Range4
    }
}

function updateRangeCircle(rangeValueInMeters){
    var rangeInstances = getRangeInstances();
    if(Range1!=null){
        var rangeUnit = rangeValueInMeters/4;
        rangeInstances.Range1.setRadius(rangeUnit);
        rangeInstances.Range1.setTooltipContent(Math.ceil((rangeUnit/1852).toFixed(0))+" nm");
        rangeInstances.Range2.setRadius(rangeUnit*2);
        rangeInstances.Range2.setTooltipContent(Math.ceil((rangeUnit*2/1852).toFixed(0))+" nm");        
        rangeInstances.Range3.setRadius(rangeUnit*3);
        rangeInstances.Range3.setTooltipContent(Math.ceil((rangeUnit*3/1852).toFixed(0))+" nm");        
        rangeInstances.Range4.setRadius(rangeUnit*4);
        rangeInstances.Range4.setTooltipContent(Math.ceil((rangeUnit*4/1852).toFixed(0))+" nm");        
    }
}

async function get_lat_lng_Radian(track_data) {
    if (track_data != null) {
        return [track_data.latitude,track_data.longitude];
    } else {
        return track_data;
    }
}

function showTrackDetailInTote(track_data){
    track_data = JSON.parse(track_data);
    if(track_data.track_label)
    document.getElementById('tote_entity_selected').innerText = track_data.track_label;
    else
    document.getElementById('tote_entity_selected').innerText = "";
    var trackToteArea = $('#track_tote_area_template').html()
    var trackToteAreaTemplate = Handlebars.compile(trackToteArea)
    $('.track_tote_area').html(trackToteAreaTemplate(track_data))

}

require('leaflet.canvas');
let isDialOn = true;
function getCourseDialLayer(){
      var BigPointLayer = L.CanvasLayer.extend({
        render: function() {
            var canvas = this.getCanvas();
            var ctx = canvas.getContext('2d');

            var date = new Date;
            var angle;
            var secHandLength = canvas.height/2;

            // CLEAR EVERYTHING ON THE CANVAS. RE-DRAW NEW ELEMENTS EVERY SECOND.
            ctx.clearRect(0, 0, canvas.width, canvas.height);        
            CENTER_DIAL();
            MARK_THE_HOURS();
            MARK_THE_SECONDS();
            SHOW_SECONDS();
            
            function CENTER_DIAL() {
                ctx.beginPath();
                ctx.arc(canvas.width/2, canvas.height/2, (canvas.height/2)-2, 0, Math.PI * 2);
                ctx.lineWidth = 3;
                ctx.fillStyle = '#353535';
                ctx.strokeStyle = '#0C3D4A';
                ctx.stroke();
            }
             function MARK_THE_HOURS() {

                for (var i = 0; i <= 36; i++) {
                    currentAngleUnit = (10*i)%360;
                    angle = (i - 9) * (Math.PI * 2) / 36;       // THE ANGLE TO MARK.
                    ctx.lineWidth = 2;            // HAND WIDTH.
                    ctx.beginPath();

                    var x1 = (canvas.width/2) + Math.cos(angle) * (secHandLength-2);
                    var y1 = (canvas.height/2) + Math.sin(angle) * (secHandLength-2);
                    
                    var x2 = (canvas.width/2) + Math.cos(angle) * (secHandLength - (secHandLength / 15));
                    var y2 = (canvas.height/2) + Math.sin(angle) * (secHandLength - (secHandLength / 15));

                    var xt = (canvas.width/2) + Math.cos(angle) * (secHandLength-(secHandLength / 8));
                    var yt = (canvas.height/2) + Math.sin(angle) * (secHandLength-(secHandLength / 8));
                     ctx.fillText(currentAngleUnit, xt, yt); 
                    ctx.fillStyle = "cyan";
                    
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                
                    ctx.strokeStyle = 'cyan';
                    ctx.stroke();
                }
            }
            function MARK_THE_SECONDS() {

                for (var i = 0; i < 360; i++) {
                    angle = (i - 9) * (Math.PI * 2) / 360;       // THE ANGLE TO MARK.
                    ctx.lineWidth = 1;            // HAND WIDTH.
                    ctx.beginPath();

                    var x1 = (canvas.width / 2) + Math.cos(angle) * (secHandLength-4);
                    var y1 = (canvas.height / 2) + Math.sin(angle) * (secHandLength-4);
                    var x2 = (canvas.width / 2) + Math.cos(angle) * (secHandLength - (secHandLength / 20));
                    var y2 = (canvas.height / 2) + Math.sin(angle) * (secHandLength - (secHandLength / 20));

                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);

                    ctx.strokeStyle = '#C4D1D5';
                    ctx.stroke();
                }
            }

            function SHOW_SECONDS() {
                var sec = 69/6
                angle = ((Math.PI * 2) * (sec / 60)) - ((Math.PI * 2) / 4);
                ctx.lineWidth = 2;              // HAND WIDTH.

                ctx.beginPath();
                // START FROM CENTER OF THE CLOCK.
                ctx.moveTo(canvas.width / 2 + Math.cos(angle) * secHandLength/1.1, canvas.height / 2+Math.sin(angle) * secHandLength/1.1);   
                // DRAW THE LENGTH.
                ctx.lineTo((canvas.width / 2 + Math.cos(angle) * secHandLength),
                    canvas.height / 2 + Math.sin(angle) * secHandLength);
                // DRAW THE TAIL OF THE SECONDS HAND.
                // ctx.moveTo(canvas.width / 2, canvas.height / 2);    // START FROM CENTER.
                // DRAW THE LENGTH.
              
                // ctx.lineTo((canvas.width / 2 - Math.cos(angle) * 20),
                //     canvas.height / 2 - Math.sin(angle) * 20);

                ctx.strokeStyle = 'red';        // COLOR OF THE HAND.
                ctx.stroke();
            }
      }
    });

    return new BigPointLayer();
}