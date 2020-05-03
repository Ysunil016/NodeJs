const properties = require('../data/Properties');
// const tcpie = require('tcpie');
const aesKey = "*(^&12qwe^&as%$%dzxc321#$%";
const aesTacticalKey = "^%$Tactical%^&SecreteKey!@#";
const Cryptr = require('cryptr');
const cryptr = new Cryptr('12qwaszx!@QWASZX');
const ping = require('ping');


//Exposing Required Functionalities Outside this File.
module.exports = {
    lobiNotification,
    getCurrrentTime,
    getUUID,
    encryptForumData,
    decryptForumData,
    encryptData,
    decryptData,
    osNotification,

    maintainTheDataInLocalStorageLimit,
    getTime,
    getDate,
    getCurrrentYear,
    pingTheServer,
    updatingUserList,
    callingAPIAtLoginTimeData,
    updateServerTimeOnCoN,
    convertTimestampForNormalFormat,
    getHeaderTime
}

//Helper Service to Make OS level Notification
function osNotification(title, message) {
    new window.Notification(title, {
        title: title,
        body: message
    });
}
//Helper Service to Make Lobi Notification
function lobiNotification(type, title, message, position, showClass, hideClass) {
    Lobibox.notify(type, {
        showAfterPrevious: true,
        delayIndicator: false,
        sound: true,
        size: 'mini',
        icon: false,
        position: position,
        title: title,
        showClass: showClass,
        hideClass: hideClass,
        msg: message
    });
}

//Helper Service to Get Current Time
function getCurrrentTime() {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var thisTime = day + '/' + month + '/' + year + ' at ' + hour + ':' + minutes;
    return thisTime.toString();
}
//Helper Service to Get Current Year
function getCurrrentYear() {
    var date = new Date();
    return date.getFullYear();
}

//Helper Service to Generate UUID
function getUUID() {
    uuidv1 = require('uuidv4');
    return uuidv1();
}
//Helper Service to Refresh the Application
function callingAPIAtLoginTimeData() {

    var server_ip = window.localStorage.getItem('server_ip');
    var apiForData = "http://" + server_ip + ":" + properties.SERVER_PORT + "/authentication-service/login-validate-user";

    require('getmac').getMac(function (err, macAddress) {
        if (err) throw err

        var ip = getIP();
        var authKey = window.localStorage.getItem('authKey')
        var username = window.localStorage.getItem('username');
        var password = window.localStorage.getItem('password');
        var unitName = properties.UNIT_NAME;

        var dataToBeSent = JSON.stringify({
            username: username,
            password: password,
            mac: macAddress,
            ip: ip,
            authKey: authKey,
            unit: unitName
        })
        // console.log(dataToBeSent);
        var xhr = new XMLHttpRequest()

        document.getElementById("preloader_index").style = "display:block";

        xhr.timeout = 10000;
        xhr.open('POST', apiForData, true);
        xhr.setRequestHeader('Content-Type', 'application/json')

        xhr.send(dataToBeSent)

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText)
                if (json.validated == true) {
                    window.localStorage.setItem('dataAtLogin', JSON.stringify(json));
                    window.location = 'index.html'
                } else {
                    alert('You Must be Deleted from Server Side');
                    window.location = 'login.html'
                }
            } else {
                // if(xhr.status !== 200) {
                //     setTimeout(()=>{
                //     pingTheServer();
                //     },5000);
                // }
                if (xhr.readyState === 4 && xhr.status != 200) {
                    var lobiMsg = '<b>Issue</b>';
                    lobiNotification('error', 'Network', lobiMsg, 'bottom center', window.innerWidth)
                    document.getElementById("preloader_index").style = "display:none";
                }
                if (xhr.ontimeout) {
                    lobiMsg = '<h4>Request TimeOut</h4>';
                    lobiNotification('error', 'Network', lobiMsg, 'top center', window.innerWidth)
                    document.getElementById("preloader_index").style = "display:none";
                }
            }
        }
    })

}
//Helper Service to Fetch IP of the System
function getIP() {
    var ip = require('ip')
    return ip.address()
}

//Helper Service to Maintain Limit of Notification Content
function maintainTheDataInLocalStorageLimit() {
    // var dataLimit = 40;
    // var headerNotification = window.localStorage.getItem('notificationHeaderData');
    // var storeName = "con_notificationData" + properties.USERNAME;
    // var recentActivityNotification = window.localStorage.getItem(storeName);
    // headerNotification = JSON.parse(headerNotification);
    // recentActivityNotification = JSON.parse(recentActivityNotification);
    // if (headerNotification != null) {
    //     if (headerNotification.data != null) {
    //         if (headerNotification.data.length > dataLimit) {
    //             var excessData = headerNotification.data.length - dataLimit;
    //             headerNotification.data.splice(0, excessData);
    //             headerNotification = JSON.stringify(headerNotification);
    //             window.localStorage.setItem('notificationHeaderData', headerNotification);
    //         }
    //     }
    // }
    // if (recentActivityNotification != null) {
    //     if (recentActivityNotification.data != null) {
    //         if (recentActivityNotification != null) {
    //             if (recentActivityNotification.data.length > dataLimit) {
    //                 var excessData = recentActivityNotification.data.length - dataLimit;
    //                 console.log(excessData);
    //                 recentActivityNotification.data.splice(0, excessData);
    //                 recentActivityNotification = JSON.stringify(recentActivityNotification);
    //                 window.localStorage.setItem(storeName, recentActivityNotification);
    //             }
    //         }

    //     }
    // }
}
//Helper Service to Fetch All User's List
function getallChatUsers(usersReceived) {
    // if (usersReceived != null) {
    //     for (var i = 0; i <= usersReceived.length - 1; i++) {
    //         if (usersReceived[i].name == properties.USERNAME)
    //             usersReceived.splice(i, 1);
    //     }
    //     return usersReceived;
    // } else {
    //     return [];
    // }
}
//Helper Service to Get Today's Time
function getTime() {
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    return hour + ":" + (date.getMinutes() < 10 ? '0' : '') + minutes;
}

function getHeaderTime() {
    var date = new Date();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    return hour + ":" + (minutes < 10 ? '0' : '') + minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

//Helper Service to Get Today's Date
function getDate() {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    return day + "-" + month + "-" + year;
}
//Helper Service to Find All Users using API Call
function updatingUserList() {
    var xhr = new XMLHttpRequest();
    document.getElementById("preloader_index").style = "display:block";
    xhr.timeout = 10000;
    var data2Send = {
        user: properties.USERNAME
    };
    xhr.open('POST', properties.API_FOR_ALL_USERS, true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(data2Send)
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText)
            window.localStorage.setItem("listOfAllUsers", JSON.stringify(json.AllUsers));
            document.getElementById("preloader_index").style = "display:none";
        } else {
            console.log(xhr.status)
            if (xhr.readyState === 4 && xhr.status != 200) {
                var lobiMsg = '<b>Issue</b>';
                lobiNotification('error', 'Network', lobiMsg, 'bottom center', window.innerWidth)
                document.getElementById("preloader_index").style = "display:none";
            }
            if (xhr.ontimeout) {
                lobiMsg = '<h4>Request TimeOut</h4>';
                lobiNotification('error', 'Network', lobiMsg, 'top center', window.innerWidth)
                document.getElementById("preloader_index").style = "display:none";
            }
        }
    }
}



function updateServerTimeOnCoN() {
    var timeStamp = window.localStorage.getItem('timestamp');
    var timerHeader = document.getElementById('currentSystemTimeInHeader');
    if (timeStamp)
        setInterval(() => {
            timeStamp += 10000;
            timerHeader.innerText = convertTimestampForHeader(timeStamp);
            console.log("Current TimeStamp " + convertTimestampToUTC(timeStamp));
        }, 10000);
    else
        setInterval(() => {
            timerHeader.innerText = getTime();
        }, 60000);
}

function convertTimestampForNormalFormat(timeStamp) {
    const currentTime = new Date(timeStamp);
    const currentDay = currentTime.getDate();
    const currentMonth = currentTime.getMonth() + 1;
    const currentYear = currentTime.getFullYear;

    const currentHour = currentTime.getHours();
    const currentMinute = (currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes();
    const currentSecond = currentTime.getSeconds();

    return currentDay + "/" + currentMonth + " " + currentHour + ":" + currentMinute;
}




//ENCRYPTION AND DECRYPTION
const aes = require('aes256');
//Helper Service to Encrypt Data
function encryptData(planeText) {
    return aes.encrypt(aesKey, planeText);
}
//Helper Service to Decrypt Data
function decryptData(encryptedData) {
    return aes.decrypt(aesKey, encryptedData);
}
//Helper Service to Encrypt Forum Data
function encryptForumData(planeText) {
    return cryptr.encrypt(planeText);
}
//Helper Service to Decrypt Forum Data
function decryptForumData(encryptedData) {
    return cryptr.decrypt(encryptedData);
}
//Helper Service to Encrypt Tactical Data
function encryptTacticalData(planeText) {
    return aes.encrypt(aesTacticalKey, planeText);
}
//Helper Service to Decrypt Tactical Data
function decryptTacticalData(encryptedData) {
    return aes.decrypt(aesTacticalKey, encryptedData);
}

//Helper Service to Restart All the Initial Services
function restartServices() {
    require('../../starters').restartServices();
}

var isDead = false;
//Helper Service to Ping Server Periodically
function pingTheServer() {
    var host = window.localStorage.getItem('server_ip');
    ping.promise.probe(host)
        .then(function (res) {
            if (res.alive == false) {
                console.log("Current Server Not Reachable");
                // errorMessageAtBottom("Server Not Reachable");
                handleHopping();
            }
        })
}
//Helper Service to Handle Hopping to Secondary Servers 
function handleHopping() {
    var hosts = properties.server_ip_all;
    hosts.forEach((host) => {
        ping.promise.probe(host)
            .then(function (res) {
                console.log(host);
                if (res.alive == true) {
                    properties.SERVER_IP = host;
                    window.localStorage.setItem('server_ip', host);
                    callingAPIAtLoginTimeData();
                }
            });
    });
}