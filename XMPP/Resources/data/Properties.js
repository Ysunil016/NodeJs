const path = require('path');

const unitBind = "RANA";
const redisLinkIP = "localhost";
const mapServerIP = "localhost";
const server_ip_all = ["172.16.43.100","192.168.1.101"];


// const server_file_data = require(path.join(path.dirname(__dirname), "../../server_ip.js"));
// const server_data = JSON.parse(JSON.stringify(server_file_data));

// const server_ip_all = server_data.secondary_ip;
// const mapServerIP = server_data.map_server_ip;
// const unitBind = server_data.unitBind;
// const redisLinkIP = server_data.redisLinkIP;


var username = window.localStorage.getItem('username');
var password = window.localStorage.getItem('password');

var server_ip = window.localStorage.getItem('server_ip');

if(username==null){
    username = "Sunil"
}

var unitNameSplit = username.split('_');
var unitName = unitNameSplit[0];
var designation = unitNameSplit[1];


var SERVER_IP = server_ip;
var SERVER_IP_XMPP = SERVER_IP;
const SERVER_PORT = "8765";

const TACTICAL_SOCKET_RECEIVE = "5922"
const TACTICAL_SOCKET_SEND = "5923"
const OWN_SOCKET_REC="6379";
const XMPP_PASSWORD = "Xmpp@123";
const XMPP_PRESENCE_PORT="9090";

const XMPP_DOMAIN = 'wesee';
const XMPP_CONFERENCE_DOMAIN = 'conference.wesee';
const NICK_NAME_CHAT_ROOM = username.toUpperCase();
const CHAT_ROOM_PASSSWORD = 'admin';

const LOGIN_URL = "/authentication-service/login-validate-user";

var ALL_DOCUMENTS_URL = "http://"+window.localStorage.getItem('server_ip')+":"+SERVER_PORT+"/file-sharing-service/uploaded-files";
var DOCUMENT_FETCHING_URL = "http://"+window.localStorage.getItem('server_ip')+":"+SERVER_PORT+"/file-sharing-service/downloadFile/";


const rabbitmqUsername = 'con';
const rabbitmqPassword = 'con';
const ExchangeName = "BOARD_EXCHANGE";

const BULLETINBOARD_URL = '/message-queue-service/publish-board-comment';

const EMAIL_URL = "/email-service/sendEmail";

const API_FOR_ALL_USERS = "http://"+window.localStorage.getItem('server_ip')+":"+SERVER_PORT+"/message-queue-service/listOfAllUsers/";

var apiForData = 'http://' + window.localStorage.getItem('server_ip') + ':' + SERVER_PORT + LOGIN_URL;
var API_FOR_SENDING_BB_MESSAGE = "http://" +  window.localStorage.getItem('server_ip')  + ":" + SERVER_PORT + BULLETINBOARD_URL;
var rabbitMQReceiver_URL = 'amqp://' + rabbitmqUsername + ':' + rabbitmqPassword + '@' + SERVER_IP;
var API_FOR_SENDING_To_EMAIL = "http://" +  window.localStorage.getItem('server_ip')  + ":" + SERVER_PORT + EMAIL_URL;

var TACTICAL_ENDPOINT = "/publish-map-data";
var RANGE_REQ_ENDPOINT = "/publish-cop-data"
var TACTICAL_TRACKS_API = "http://"+ window.localStorage.getItem('server_ip') +":"+"6999"+TACTICAL_ENDPOINT;
var RANGE_REQUEST_API = "http://"+ window.localStorage.getItem('server_ip') +":"+"6999"+RANGE_REQ_ENDPOINT;
var OWN_SHIP_POSITION = null;

module.exports = {
    unit_hardening:unitBind,
    handleHopping:handleHopping,
    server_ip_all:server_ip_all,
    mapServerIP:mapServerIP,
    pingAServer:pingAServer,
    redisLinkIP:redisLinkIP,

    USERNAME: username,
    UNIT_NAME: unitName,
    DESIGNATION: designation,

    SERVER_IP: SERVER_IP,
    SERVER_PORT:SERVER_PORT,
    SERVER_IP_XMPP: SERVER_IP_XMPP,
    XMPP_PASSWORD:XMPP_PASSWORD,
    XMPP_DOMAIN: XMPP_DOMAIN,
    XMPP_CONFERENCE_DOMAIN: XMPP_CONFERENCE_DOMAIN,
    NICK_NAME_CHAT_ROOM: NICK_NAME_CHAT_ROOM,
    CHAT_ROOM_PASSSWORD:CHAT_ROOM_PASSSWORD,
    XMPP_PRESENCE_PORT:XMPP_PRESENCE_PORT,

    LOGIN_URL: LOGIN_URL,

    ALL_DOCUMENTS_URL:ALL_DOCUMENTS_URL,
    DOCUMENT_FETCHING_URL:DOCUMENT_FETCHING_URL,

    rabbitmqUsername: rabbitmqUsername,
    rabbitmqPassword: rabbitmqPassword,
    ExchangeName: ExchangeName,
    BULLETINBOARD_URL: BULLETINBOARD_URL,

    apiForData: apiForData,

    API_FOR_SENDING_BB_MESSAGE: API_FOR_SENDING_BB_MESSAGE,
    rabbitMQReceiver_URL: rabbitMQReceiver_URL,

    API_FOR_SENDING_To_EMAIL:API_FOR_SENDING_To_EMAIL,

    TACTICAL_SOCKET_RECEIVE:TACTICAL_SOCKET_RECEIVE,
    TACTICAL_SOCKET_SEND:TACTICAL_SOCKET_SEND,
    OWN_SOCKET_REC:OWN_SOCKET_REC,
    API_FOR_ALL_USERS:API_FOR_ALL_USERS,
    TACTICAL_TRACKS_API:TACTICAL_TRACKS_API,
    RANGE_REQUEST_API:RANGE_REQUEST_API,
    OWN_SHIP_POSITION:OWN_SHIP_POSITION
}

const ping = require('ping');

// HOPPING IPs
function handleHopping(){
    var hosts = server_ip_all;
    hosts.forEach((host)=>{
        ping.promise.probe(host)
        .then(function (res) {
            if(res.alive == true){
            console.log("Setting Server IP as "+host);
            SERVER_IP = host;
            window.localStorage.setItem('server_ip',host);
        }
        });
    });
}


function pingAServer(ip){
    ping.promise.probe(ip)
        .then(function (res) {
            if(res.alive == true){
                console.log("Setting IP "+ip);
                window.localStorage.setItem('server_ip',ip);
        }else{
            handleHopping();
        }
    });
}


