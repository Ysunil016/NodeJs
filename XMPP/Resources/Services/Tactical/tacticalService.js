var properties = require('../../data/Properties');
var amqp = require('amqplib/callback_api');
const dgram = require('dgram');
var redisClient = require('redis').createClient();
// const redisServer = require('redis').createClient(6379,properties.SERVER_IP);
const L = require('leaflet');
const linkTrackHandler = require('../Tactical/linkTrackHandler');
const leaflet_map = require('./leafletMap');
const geoLib = require('geolib');
var wasDead = false;
const redisLINK = require('redis').createClient(6379, properties.redisLinkIP);


//Tactical Service to Handle COP Track Data Received over RabbitMQ
function listenRabbitMQForTacticalData(message) {
    return new Promise(async (resolve, reject) => {
        await publishDataToRedisForLINKII(message);
        var trackDataSplitter = message.split(',');
        var jsonTrackData = await receivedTrackStringParser(trackDataSplitter);
        if (jsonTrackData)
            await linkTrackHandler.store_track_in_tacticalMapCOP_store(jsonTrackData.id, jsonTrackData);
        resolve(true);
    })
}

//Tactical Service to Publish COP Tracks Data back to LINK II, after Receiving from Server
function publishDataToRedisForLINKII(copDataToLink) {
    redisLINK.publish("CON_LINK_CHANNEL", copDataToLink, (err, resp) => {
        if (err)
            console.log("Error while Publishing Tracks to LINK II");
    });
}

//Tactical Service to Send Buffer Accumulated to the Server Periodically
function sendTacticalDataToServer() {
    var dataTrack = linkTrackHandler.get_con_client_to_server_buffer();
    var data2Send = JSON.stringify(dataTrack);
    // console.log(data2Send)
    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;

    xhr.open('POST', properties.TACTICAL_TRACKS_API, true)


    // xhr.open('POST',properties.TACTICAL_TRACKS_API, true)
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.send(data2Send);

    xhr.onreadystatechange = function () {
        if (xhr.status == 200) {
            linkTrackHandler.flush_track_server_buffer();
        } else {
            console.error("Some Issue while Sending");
        }
    }

}

//Tactical Service to Subscribe to Redis for Track Data from SADL
function getCurrentEntityData(PORT, HOST) {
    var redisClient = require('redis').createClient(PORT,HOST);
    redisClient.on('message', (channel, message) => {
        var dataReceived = JSON.parse(message);
        dataReceived.timestamp = Date.now();
        switch (channel) {
            case "LINK_CON_POWNT": {
                HANDLE_LINK_CON_POWNT(dataReceived);
                break;
            }
            case "LINK_CON_PRTRK": {
                HANDLE_LINK_CON_PRTRK(dataReceived);
                break;
            }
            case "LINK_CON_PMTRK": {
                HANDLE_LINK_CON_PMTRK(dataReceived);
                break;
            }
            case "LINK_CON_PADSB": {
                HANDLE_LINK_CON_PADSB(dataReceived);
                break;
            }
        }



    });

    redisClient.on("error", function (err) {
        console.log("Some Issue In Connecting to Redis");
    });

    redisClient.subscribe('LINK_CON_POWNT', 'LINK_CON_PRTRK', 'LINK_CON_PMTRK', 'LINK_CON_PADSB');
}

//Tactical Service to Display Track Dynamic Data at Header
function handleLatLongDataToDisplay(rep_unit,latitude, longitude, course, speed) {
    var latitude_header = document.getElementById('header_latitude');
    var longitude_header = document.getElementById('header_longitude');
    var course_header = document.getElementById('header_course');
    var speed_header = document.getElementById('header_speed');

    var tacticalOwnLatTrack = document.getElementById('ownPositionLatTactical');
    var tacticalOwnLongTrack = document.getElementById('ownPositionLongTactical');
    var tacticalOwnCOGTrack = document.getElementById('ownPositionCOGTactical');
    var tacticalOwnSOGTrack = document.getElementById('ownPositionSOGTactical');


    properties.OWN_SHIP_POSITION = {
        rep_unit:rep_unit,
        latitude: latitude,
        longitude: longitude
    };

        var lat_dir = 'N';
        var lng_dir = 'E';
        if (latitude < 0)
            lat_dir = 'S';
        if (longitude < 0)
            lng_dir = 'W';


    var latitudeSexa = geoLib.decimalToSexagesimal(latitude)+" "+lat_dir;
    var longitudeSexa = geoLib.decimalToSexagesimal(longitude)+" "+lng_dir;

    if (latitude_header != null) {
        latitude_header.innerText =  latitudeSexa;
        longitude_header.innerText = longitudeSexa;
        course_header.innerText = parseFloat(course) + " deg.";
        speed_header.innerText = parseFloat(speed) + " nm";
    }
    if (tacticalOwnLatTrack != null) {
        tacticalOwnLatTrack.innerText = latitudeSexa;
        tacticalOwnLongTrack.innerText = longitudeSexa;
        tacticalOwnCOGTrack.innerText = course;
        tacticalOwnSOGTrack.innerText = speed;

        // tacticalCourseSpeedTrack.innerHTML = course+" (Deg)&nbsp;&nbsp;"+speed+" nm";
    }

}

// // Draw the Range Circle Around OWN LINK_UNIT
// var Range1 = null;
// var Range2 = null;
// var Range3 = null;
// var Range4 = null;
// async function rangeCircleAroundOwn(latitude, longitude,rangeLevel) {
//     var map = leaflet_map.getMap();
//     var track_data = {
//         latitude,
//         longitude
//     }
//     var degreeConversion = await linkTrackHandler.get_lat_lng_Radian(track_data);
//     if (Range1 != null) {
//         Range1.remove();
//         Range2.remove();
//         Range3.remove();
//         Range4.remove();
//     }

//     Range1 = L.circle(degreeConversion, 200000, {
//         renderer:'Sunil',
//         color: 'teal',
//         fill: false,
//         stroke:1
//     }).addTo(map);
//     Range2 = L.circle(degreeConversion, 400000, {
//         color: '#CC84D0',
//         fill: false
//     }).addTo(map);
//     Range3 = L.circle(degreeConversion, 600000, {
//         color: '#FF6FB7',
//         fill: false
//     }).addTo(map);
//     Range3 = L.circle(degreeConversion, 600000, {
//         color: '#FF6FB7',
//         fill: false
//     }).addTo(map);
//      Range4 = L.circle(degreeConversion, 600000, {
//         color: '#FF6FB7',
//         fill: false
//     }).addTo(map);

//     return {}
// }

//Tactical Service to Handle POWNT Track from LINK SADL (Storage in Redis and Buffer)
async function HANDLE_LINK_CON_POWNT(dataReceived) {
    handleLatLongDataToDisplay(dataReceived.net_unit,dataReceived.latitude, dataReceived.longitude, dataReceived.course, dataReceived.speed);    
    var id_for_the_track = dataReceived.net_unit;
    dataReceived.rep_unit_name = await getUnitNameFromRepNo(id_for_the_track);
    dataReceived.id = id_for_the_track;
     
    var isTrackAvailableInID_Array = await linkTrackHandler.is_ID_in_ID_ARRAY_STORE(id_for_the_track);
    if (isTrackAvailableInID_Array)
        linkTrackHandler.con_client_updateTrack_to_server_buffer(dataReceived);
    // linkTrackHandler.con_client_freshTrack_to_server_buffer(dataReceived);            
    else
        linkTrackHandler.con_client_freshTrack_to_server_buffer(dataReceived);

    await linkTrackHandler.store_ID_in_ID_ARRAY_store(id_for_the_track, JSON.stringify(dataReceived));
    await linkTrackHandler.store_track_in_tacticalMapPF_store(id_for_the_track, dataReceived);
    await linkTrackHandler.store_track_in_tacticalMapNetUnit_store(id_for_the_track, dataReceived);

}

//Tactical Service to Handle PRTRK Track from LINK SADL (Storage in Redis and Buffer)
async function HANDLE_LINK_CON_PRTRK(dataReceived) {
    var id_for_the_track = dataReceived.rep_unit + dataReceived.link_track_number;
    dataReceived.rep_unit_name = await getUnitNameFromRepNo(dataReceived.rep_unit);
    dataReceived.id = id_for_the_track;

    var isTrackAvailableInID_Array = await linkTrackHandler.is_ID_in_ID_ARRAY_STORE(id_for_the_track);
    if (isTrackAvailableInID_Array)
        // linkTrackHandler.con_client_freshTrack_to_server_buffer(dataReceived);
        linkTrackHandler.con_client_updateTrack_to_server_buffer(dataReceived);
    else
        linkTrackHandler.con_client_freshTrack_to_server_buffer(dataReceived);

    var storeTrackInID_Array = await linkTrackHandler.store_ID_in_ID_ARRAY_store(id_for_the_track, JSON.stringify(dataReceived));
    var storeTrackInTacticalMapPF = await linkTrackHandler.store_track_in_tacticalMapPF_store(id_for_the_track, dataReceived);

}

//Tactical Service to Handle PMTRK Track from LINK SADL (Storage in Redis)
async function HANDLE_LINK_CON_PMTRK(dataReceived) {
    var id_for_the_track = dataReceived.rep_unit + dataReceived.MMSI;
    dataReceived.id = id_for_the_track;
    // var isAvailableInTacticalMap = await linkTrackHandler.isAvailableInTacticalMap(id_for_the_track);
    var storeTrackInTacticalMapPF = await linkTrackHandler.store_track_in_tacticalMapPF_store(id_for_the_track, dataReceived);
}

//Tactical Service to Handle PADSB Track from LINK SADL (Storage in Redis)
async function HANDLE_LINK_CON_PADSB(dataReceived) {
    var id_for_the_track = dataReceived.net_unit + dataReceived.link_track_number;
    dataReceived.id = id_for_the_track;

    var storeTrackInTacticalMap = await linkTrackHandler.store_track_in_tacticalMapPF_store(id_for_the_track, dataReceived);
}

//Tactical Service to Parse Data Received from CoN Server over RabbitMQ Subscription
function receivedTrackStringParser(stringTrackArray) {
    return new Promise(async (resolve, reject) => {
        switch (stringTrackArray[0]) {
            case "$PRTRK":
                var objectReceived = {
                    id: stringTrackArray[2] + stringTrackArray[3],
                    header: stringTrackArray[0],
                    link_track_number: stringTrackArray[3],
                    category: stringTrackArray[1],
                    identity: stringTrackArray[4],
                    source: stringTrackArray[5],
                    rep_unit: stringTrackArray[2],
                    track_label: stringTrackArray[6],
                    course: stringTrackArray[7],
                    speed: stringTrackArray[8],
                    latitude: stringTrackArray[9],
                    longitude: stringTrackArray[10],
                    height_depth: stringTrackArray[11],
                    rep_unit_name: await getUnitNameFromRepNo(stringTrackArray[2]),
                    date: stringTrackArray[12],
                    time: stringTrackArray[13]
                }
                resolve(objectReceived);
                break;
            case "$POWNT":
                var objectReceived = {
                    id: stringTrackArray[1],
                    header: stringTrackArray[0],
                    net_unit: stringTrackArray[1],
                    category: stringTrackArray[2],
                    source: stringTrackArray[3],
                    course: stringTrackArray[4],
                    speed: stringTrackArray[5],
                    latitude: stringTrackArray[6],
                    longitude: stringTrackArray[7],
                    height_depth: stringTrackArray[8],
                    call_sign: stringTrackArray[9],
                    date: stringTrackArray[10],
                    time: stringTrackArray[11],
                    rep_unit_name: await getUnitNameFromRepNo(stringTrackArray[1]),
                }
                await linkTrackHandler.store_track_in_tacticalMapNetUnit_store(objectReceived.id, objectReceived);
                resolve(objectReceived);
                break;
            case "$PCTRK":
                var objectReceived = {
                    id: stringTrackArray[1],
                    header: stringTrackArray[0],
                    mmsi: stringTrackArray[1],
                    track_label: stringTrackArray[2],
                    source: stringTrackArray[3],
                    rep_unit: stringTrackArray[4],
                    ship_type: stringTrackArray[5],
                    course: stringTrackArray[6],
                    speed: stringTrackArray[7],
                    latitude: stringTrackArray[8],
                    longitude: stringTrackArray[9],
                    date: stringTrackArray[10],
                    time: stringTrackArray[11]
                }
                resolve(objectReceived);
                break;
            case "$PADSB":
                var objectReceived = {
                    id: stringTrackArray[10] + stringTrackArray[2],
                    header: stringTrackArray[0],
                    flight_name: stringTrackArray[1],
                    link_track_number: stringTrackArray[2],
                    actual_departure: stringTrackArray[3],
                    estimated_arrival: stringTrackArray[4],
                    source: stringTrackArray[5],
                    destination: stringTrackArray[6],
                    true_air_speed: stringTrackArray[7],
                    squawk: stringTrackArray[8],
                    course: stringTrackArray[9],
                    rep_unit: stringTrackArray[10],
                    latitude: stringTrackArray[11],
                    longitude: stringTrackArray[12],
                    height_depth: stringTrackArray[13],
                    track_time: stringTrackArray[14]
                }
                resolve(objectReceived);
                break;
        }
        resolve(null);
    });
}

/*
"SUR"
course
:
"6"
date
:
"21-22-2019"
header
:
"$PRTRK"
height_depth
:
"0"
id
:
"1651"
identity
:
"H"
latitude
:
"17.234324"
link_track_number
:
"1"
longitude
:
"84.245346"
rep_unit
:
"165"
rep_unit_name
:
"RANA"
source
:
"CMS"
speed
:
"7"
time
:
"12:24:14"
track_label
:
"5"
*/ 
//Tactical Service to Drop Tracks If No Update has Encountered for Certain Period of Time
function dropTracksAutomatically() {
    return new Promise(async (resolve, reject) => {
        await dropTracksAutomaticallyPF();
        await dropTracksAutomaticallyNetUnit();
        await dropTracksAutomaticallyCOP();
        resolve(true);
    })
}

//Tactical Service to Find Difference b/w Track Received TimeStamp and System's Current Time Stamp;
function compareTimeStampInMin(trackTime) {
    return new Promise((resolve, reject) => {
        // Drop Time Comparision
        var dropTime = 120000;
        var currentTime = Date.now();
        if ((currentTime - trackTime) > dropTime) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

//Tactical Service to Handle Platform Track Dropping
function dropTracksAutomaticallyPF() {
    return new Promise((resolve, reject) => {
        redisClient.hgetall("MAP_DATA_ID_Array_PF", async (err, resp) => {
            if (resp) {
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    var track_data = JSON.parse(resp[track_keys[i]]);
                    var isOut = await compareTimeStampInMin(track_data.timestamp);
                    if (isOut)
                        await removeKeyFromRedis("MAP_DATA_ID_Array_PF", track_keys[i])
                }
            }
            resolve(true);
        })
    })
}

//Tactical Service to Handle Force Track Dropping
function dropTracksAutomaticallyNetUnit() {
    return new Promise((resolve, reject) => {
        redisClient.hgetall("MAP_DATA_ID_Array_NET_UNIT", async (err, resp) => {
            if (resp) {
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    var track_data = JSON.parse(resp[track_keys[i]]);
                    var isOut = await compareTimeStampInMin(track_data.timestamp);
                    if (isOut)
                        await removeKeyFromRedis("MAP_DATA_ID_Array_NET_UNIT", track_keys[i])
                }
            }
            resolve(true);
        })
    })
}

//Tactical Service to Handle COP Track Dropping
function dropTracksAutomaticallyCOP() {
    return new Promise((resolve, reject) => {
        redisClient.hgetall("MAP_DATA_ID_Array_COP", async (err, resp) => {
            if (resp) {
                var track_keys = Object.keys(resp);
                for (var i = 0; i < track_keys.length; i++) {
                    var track_data = JSON.parse(resp[track_keys[i]]);
                    var isOut = await compareTimeStampInMin(track_data.timestamp);
                    if (isOut)
                        await removeKeyFromRedis("MAP_DATA_ID_Array_COP", track_keys[i])
                }
            }
            resolve(true);
        })
    })
}

//Tactical Service to Remove KeyValue from Redis Hash
function removeKeyFromRedis(id, key) {
    return new Promise((resolve, reject) => {
        redisClient.hdel(id, key, (err, resp) => {
            redisClient.hdel("ID_Array", key, (err, res) => {
                resolve(true);
            })
        })
    })
}

//FULSH REDIS COMPLETELY
function flushRedis() {
    return new Promise((resolve, reject) => {
        redisClient.del('ID_Array', 'MAP_DATA_ID_Array_PF', 'MAP_DATA_ID_Array_NET_UNIT', 'MAP_DATA_ID_Array_COP', (err, res) => {
            resolve(true);
        });
    })
}

// Checking if Redis has List of Link Tracks with Rep Number
function isUnitsInRedis() {
    return new Promise((resolve, reject) => {
        redisClient.hgetall('LINK_UNITS', (err, resp) => {
            if (resp)
                resolve(true);
            else
                resolve(false);
        })
    })
}

// Storing Link Track Data with Reporting Number
function storeLinkUnitInRedis() {
    var units_data = require('../../data/reporting_unit');
    return new Promise((resolve, reject) => {
        for (let i = 0; i < units_data.length; i++) {
            redisClient.hset('LINK_UNITS', units_data[i].rep_unit_no, units_data[i].UnitName);
        }
        resolve(true);
    })
}

// Fetching Unit Name from Reporting Unit Number
function getUnitNameFromRepNo(repNo) {
    return new Promise((resolve, reject) => {
        redisClient.hget('LINK_UNITS', repNo, (err, resp) => {
            if (resp)
                resolve(resp);
            else
                resolve(respNo);
        })
    })
}

//Range Request at Successful Login
function rangeRequestToServer(ownPosition,range,status){
    var dataToSend = {
        reporting_unit:ownPosition.rep_unit,
        range:range,
        status:status
    }
    var data2Send = JSON.stringify(dataToSend);
    var xhr = new XMLHttpRequest();
    xhr.timeout = 5000;

    xhr.open('POST', properties.RANGE_REQUEST_API, true)
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.send(data2Send);

    xhr.onreadystatechange = function () {
        if (xhr.readyState==4 && xhr.status == 200) {
            console.log("Successfully Sent");
        } 
    }





}



//Exposing Required Functionalities Outside this File.
module.exports = {
    listenRabbitMQForTacticalData: listenRabbitMQForTacticalData,
    getCurrentEntityData: getCurrentEntityData,
    sendTacticalDataToServer: sendTacticalDataToServer,
    dropTracksAutomatically: dropTracksAutomatically,
    rangeRequestToServer:rangeRequestToServer,
    flushRedis: flushRedis,
    isUnitsInRedis: isUnitsInRedis,
    storeLinkUnitInRedis: storeLinkUnitInRedis
}