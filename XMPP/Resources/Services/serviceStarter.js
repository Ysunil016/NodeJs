const mongoose = require('mongoose');
const MongoURI = require('../database/config/variables');
const loginObject = require('../data/loginObject');
const properties = require('../data/Properties');
const xmppService = require('../Services/XmppSubscriber');
const forumService = require('../Services/forumService');
const rabbitMQService = require('../Services/mqSubscriber');
var chatService = require('../Services/chatService');

const dashService = require('../Services/dashboardService');

var tacticalService = require('../Services/Tactical/tacticalService');
var extras = require('../Services/helperService');
var documentService = require('../Services/documentService');

const username = loginObject.username;

//Initial Service that Runs at Application Startup
async function startServices() {
    mongoose.connect(MongoURI.MongoURL, {
        useNewUrlParser: true
    }, (err) => {
        if (err != null)
            extras.lobiNotification("error", "Local Database", "No Local Database Found", "top center", "fadeIn", "fadeOut");
        else
            console.log('Database Connected');
    })

    //Connection to XMPP Server
    // await chatService.makeChatRoominLocalStorage();
    // if (!await tacticalService.isUnitsInRedis()) {
    //     await tacticalService.storeLinkUnitInRedis();
    // }

    // setTimeout(() => {
    //     xmppService.connectToChatServer(username, properties.XMPP_PASSWORD, properties.SERVER_IP_XMPP, properties.XMPP_DOMAIN);
    //     forumService.checkForumEntry();
    // }, 1000);

    // //Connecting to RabbitMQ Server
    // setTimeout(() => {
    //     rabbitMQService.connectToRabbitMQ();
    // }, 2000);


    //Fetch All Documents
    // setTimeout(() => {
    //     documentService.fetchDocumentsDataFromServer();
    // }, 10000);


    // //Tactical Listner and Transmitter
    // await tacticalService.flushRedis();
    // setTimeout(() => {
    //     tacticalService.getCurrentEntityData(6379, properties.redisLinkIP);
    // }, 3000);



    // //Maintaining Notification Space for Latest Messages
    // setTimeout(() => {
    //     extras.maintainTheDataInLocalStorageLimit();
    // }, 5000);

    //Setting Current Time to CoN Header

    setInterval(() => {
        var timerHeader = document.getElementById('currentSystemTimeInHeader');
        var tacticalTimeHeader = document.getElementById('currentSystemTimeTactical');
        var currentTime = extras.getHeaderTime()
        if (timerHeader)
            timerHeader.innerText = currentTime;
        if (tacticalTimeHeader)
            tacticalTimeHeader.innerText = currentTime;
    }, 1000);


    // //Drop Tracks After 3 Min in their TimeStamp
    // setInterval(() => {
    //     console.log("Auto Drop");
    //     tacticalService.dropTracksAutomatically()
    // }, 120000);

    // // Ingnite Range Request At Login Time
    // setInterval(() => {
    //     if (properties.OWN_SHIP_POSITION)
    //         tacticalService.rangeRequestToServer(properties.OWN_SHIP_POSITION, 512, 1);
    // }, 20000);

    //Pushing Track Data to Server Periodically
    setInterval(() => {
        tacticalService.sendTacticalDataToServer();
    }, 30000);

    //Pinging for Server every 30 Sec
    setInterval(() => {
        extras.pingTheServer();
    }, 30000);



}

//Services Restart After Connection Gets Established
function restartServices() {
    xmpp.disconnectXMPP();

    chat_function.makeChatRoominFileSystem();
    //XMPP Connection
    setTimeout(() => {
        xmppService.connectToXMPP(username, properties.XMPP_PASSWORD, properties.SERVER_IP_XMPP, properties.XMPP_DOMAIN);
    }, 1000);

    //RabbitMQ Connect
    setTimeout(() => {
        rabbitMQService.connectToRabbitMQ();
    }, 2000);


    //Fetch All Documents
    setTimeout(() => {
        documentService.fetchDocumentsDataFromServer();
    }, 1000);


    setTimeout(() => {
        tacticalService.listenRabbitMQForTacticalData(username, properties.TACTICAL_SOCKET_SEND, "localhost");
    }, 3000);
}


//Exposing Required Functionalities Outside this File.
module.exports = {
    startServices: startServices,
    restartServices: restartServices
};









































//DATA RECEIVED DURING LOGIN





// BADGE STATUS FROM LAST LOGIN
// {
//     notificationBadgeStatusLocalStorage = window.localStorage.getItem('badgeHeaderOtherNotification');
//     messageBadgeStatusLocalStorage = window.localStorage.getItem('badgeHeaderMessageNotification');

//     if (notificationBadgeStatusLocalStorage === null) {
//         notificationBadgeStatusLocalStorage = 0;
//     }
//     if (messageBadgeStatusLocalStorage === null) {
//         messageBadgeStatusLocalStorage = 0;
//     }
// }



// window.localStorage.setItem('badgeHeaderMessageNotification', '0');



// var messageBadgeStatusLocalStorage = window.localStorage.getItem('badgeHeaderMessageNotification');