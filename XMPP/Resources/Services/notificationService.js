const properties = require('../data/Properties');
const redisClient = require('redis').createClient();

//Exposing Required Functionalities Outside this File.
module.exports = {
    storeNotificationDataInLocalStorage,
    retrieveNotificationDataFromLocalStorage,
    getDataForNotificationHeader
}


//Notification Service to Store Data in LocalStorage
function storeNotificationDataInLocalStorage(data) {
    var storageName = "con_notificationData" + properties.USERNAME;
    var notificationData = window.localStorage.getItem(storageName);
    if (notificationData == null) {
        var notificationDataString = JSON.stringify({
            data: [data]
        });
        window.localStorage.setItem(storageName, notificationDataString);
    } else {
        notificationData = JSON.parse(notificationData);
        notificationData.data.push(data);
        var notificationDataString = JSON.stringify(notificationData);
        window.localStorage.setItem(storageName, notificationDataString);
    }
}
//Notification Service to Fetch Data in LocalStorage
function retrieveNotificationDataFromLocalStorage() {
    var storageName = "con_notificationData" + properties.USERNAME;
    var notificationData = window.localStorage.getItem(storageName);
    if (notificationData == null) {
        var notificationDataString = JSON.stringify({
            data: []
        });
        window.localStorage.setItem(storageName, notificationDataString);
        return (JSON.parse(notificationDataString));
    }
    notificationData = JSON.parse(window.localStorage.getItem(storageName));

    return (notificationData.data);
}
//Notification Service to Get Data from LocalStorage from Header
function getDataForNotificationHeader() {
    return new Promise((resolve, reject) => {
        var storageName = "con_notificationData" + properties.USERNAME;
        var notificationData = window.localStorage.getItem('notificationHeaderData');
        if (notificationData == null) {
            var notificationDataString = JSON.stringify({
                data: []
            });
            window.localStorage.setItem('notificationHeaderData', notificationDataString);
        }
        notificationData = JSON.parse(window.localStorage.getItem('notificationHeaderData'));
        if (notificationData.userName != properties.USERNAME) {
            window.localStorage.removeItem('notificationHeaderData');
            retrieveNotificationDataFromLocalStorage();
        }
        resolve(notificationData.data);
    })
}


//Notificaition Service for Badge Handler
function notificationBadgeHandler() {



}