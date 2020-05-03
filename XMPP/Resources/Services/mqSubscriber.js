const amqp = require('amqplib/callback_api')
const extras = require('../Services/helperService');
const properties = require('../data/Properties');
const loginObject = require('../data/loginObject');
const forumSchema = require('../database/schema/forumSchema').forumMessageSchema;
const emailSchema = require('../database/schema/emailSchema');
const forumSevices = require('./forumService');
const notificationService = require('./notificationService');
const dashboardService = require('./dashboardService');
const tacticalService = require('./Tactical/tacticalService');

const username = properties.USERNAME;

//Exposing Required Functionalities Outside this File.
module.exports = {
    connectToRabbitMQ
}



//mqService to Subscribe to a Queue
function connectToRabbitMQ() {
    try {
        amqp.connect(properties.rabbitMQReceiver_URL, function (err, conn) {
            if (conn == undefined) {
                extras.lobiNotification('error', 'Rukmani Unreachable*', 'Connectivity Lost', 'top center', 'fadeIn', 'fadeOut');
            }
            conn.createChannel(function (err, ch) {

                var ex = properties.ExchangeName
                var tfgExchanges = loginObject.TFG_FORCES;
                var tfgCount = tfgExchanges.length;
                if (tfgCount > 0) {
                    for (let i = 0; i < tfgCount; i++) {
                        ch.bindQueue(username, tfgExchanges[i].defaultBoard, '');
                        console.log(tfgExchanges[i].defaultBoard);
                    }
                }
                ch.bindQueue(username, 'TACTICAL_EXCHANGE', );

                ch.assertQueue('', {
                    exclusive: true
                }, function (err, q) {
                    ch.consume(username, async (msg) => {
                        var toStringMessage = msg.content.toString();
                        console.log(toStringMessage)
                        if (msg.fields.routingKey == "tactical") {
                            await tacticalService.listenRabbitMQForTacticalData(toStringMessage);
                        } else {
                            toStringMessage = (JSON.parse(toStringMessage));
                            if (toStringMessage.messageType == "Forum") {
                                handlingForumReceivedData(toStringMessage);
                            }
                            if (toStringMessage.messageType == "Email") {
                                handlingEmailReceivedData(toStringMessage);
                            }
                            if (toStringMessage.messageType == "Notification") {
                                handlingNotificationReceivedData(toStringMessage);
                            }
                        }
                    }, {
                        noAck: true
                    })

                })
            })
        })
    } catch (e) {
        if (err) {
            setTimeout(() => {
                extras.lobiNotification('error', 'Connectivity Lost', 'Rukmani Not Reachable', 'center', 'fadeIn', 'fadeOut');
                connectToRabbitMQ();
            }, 10000);
        }
    }
}

//mqService to Handle Forum Message Published to the Queue-Exchange
async function handlingForumReceivedData(toStringMessage) {
    var groupName = toStringMessage.groupName;
    var bbName = toStringMessage.bbName;
    var forceName = toStringMessage.forceName;
    var commentR = toStringMessage.comment;
    var sender = toStringMessage.sender;
    var senderTime = toStringMessage.time;
    var unitName = properties.UNIT_NAME;
    var comment = extras.decryptForumData(commentR);

    var bulletinBoard = bbName
    var sender = sender
    var senderUnit = sender.split('_')
    var timeFromSender = senderTime
    var messageReceived = comment
    if (!(sender === unitName)) {

        if (forumSevices.bbNameExistInBoard(bbName)) {
            var forumQuery = {
                username: username,
                bulletinBoardName: bbName
            }
            var dataToStore = {
                $push: {
                    comments: {
                        time: timeFromSender,
                        sender: sender,
                        comment: messageReceived
                    }
                }
            }
            var forumQuery = {
                username: properties.USERNAME,
                bulletinBoardName: bulletinBoard
            }
            forumSevices.pushForumMessage(forumQuery, dataToStore);

            var mainD = document.getElementById('bbChatSectionFor' + bulletinBoard)
            if (mainD !== null) {
                var dataToShow = {
                    sender: sender,
                    comment: messageReceived,
                    time: timeFromSender
                }
                forumSevices.updateForumPanelScreen(bbName, dataToShow);
            } else {
                var notificationBadge = document.getElementById('notificationBadge');
                if (notificationBadge !== null)
                    notificationBadge.style.display = "none";

                // NOTIFICATIONAL SIGNAL GENERATION
                var messageToShow = sender + "-> " + messageReceived;
                extras.osNotification(bbName, messageToShow);
                extras.lobiNotification('info', bulletinBoard, messageToShow, 'top right', 'fadeIn', 'fadeOut');
            }

            timeFromSender = extras.convertTimestampForNormalFormat(parseInt(timeFromSender));
            var dataToStore = {
                messageType: 'Forum',
                sender: sender,
                message: comment,
                time: timeFromSender,
                sendTo: bbName
            }

            notificationService.storeNotificationDataInLocalStorage(dataToStore);
            // notification_functions.storeDataForNotificationHeader(dataToStore);
            dashboardService.updateRecentActivityDashboard(bulletinBoard, sender, 'me', messageReceived, timeFromSender);
        } else {
            var forumQuery = {
                username: username,
                bulletinBoardName: bbName
            }
            var isAvailableInDatabase = await forumSevices.findForumInDatabase(forumQuery);
            if (isAvailableInDatabase) {
                var dataToStore = {
                    $push: {
                        comments: {
                            time: timeFromSender,
                            sender: sender,
                            comment: messageReceived
                        }
                    }
                }
                var forumQuery = {
                    username: properties.USERNAME,
                    bulletinBoardName: bulletinBoard
                }
                forumSevices.pushForumMessage(forumQuery, dataToStore);
            } else {
                var newForumData = {
                    username: properties.USERNAME,
                    bulletinBoardName: bbName,
                    groupName: groupName,
                    forceName: forceName,
                    comments: [{
                        time: timeFromSender,
                        sender: sender,
                        comment: messageReceived
                    }]
                }
                forumSevices.createAndPushForumMessage(newForumData);
            }

        }
    }
}



//mqService to Handle Email Data Published to Queue
function handlingEmailReceivedData(toStringMessage) {
    var uuid = extras.getUUID();
    toStringMessage.uuid = uuid;
    toStringMessage.username = properties.USERNAME;
    toStringMessage.content = extras.decryptData(toStringMessage.content);
    saveMailToInbox(toStringMessage);
    showMessageInInbox(toStringMessage);
}

//mqService to Save Email in Inbox in Database
function saveMailToInbox(toStringMessage) {
    emailSchema.eInboxModel.insertMany(toStringMessage).then(res => {}).catch(err => {
        console.log(err)
    });
}

//mqService to Show Inbox Message in UI
function showMessageInInbox(toStringMessage) {
    var INBOX_Frame = document.getElementById('areaForInboxDataFromDatabase');
    if (INBOX_Frame) {
        var div1 = document.createElement('div');
        div1.className = "new-email";
        div1.id = toStringMessage.uuid;
        var span1 = document.createElement('span');
        span1.className = "emailCheck";
        var input = document.createElement('input');
        input.type = "checkbox";
        input.onclick = "emailItemCheck(" + toStringMessage.uuid + ")";
        span1.appendChild(input);

        var div2 = document.createElement('div');
        div2.onclick = "viewInboxMail(" + toStringMessage.uuid + ")";

        var span3 = document.createElement('span');
        span3.className = "sender";
        span3.innerText = toStringMessage.sender;
        var span4 = document.createElement('span');
        span4.className = "content";
        span4.innerText = toStringMessage.subject;
        var span5 = document.createElement('span');
        span5.className = "time";
        span5.innerText = toStringMessage.time;

        div1.appendChild(span1);
        div1.appendChild(div2);
        div2.appendChild(span3);
        div2.appendChild(span4);
        div2.appendChild(span5);
        INBOX_Frame.appendChild(div1);


    } else {
        extras.lobiNotification('info', "Email :" + toStringMessage.sender, toStringMessage.subject, 'top right', 'fadeIn', 'fadeOut');
    }
}

//mqService to Handle Notification Data from Queue Subscription
function handlingNotificationReceivedData(notificationData) {
    console.log(notificationData)
    var {
        message,
        action,
        actionTo,
        units
    } = notificationData;
    switch (notificationData.action) {
        case "add": {
            var units = notificationData.units;
            var splitedDS = units.split(",");
            console.log(splitedDS)
            var actionOn = notificationData.actionOn;
            for (var i = 0; i < splitedDS.length; i++)
                extras.lobiNotification('info', 'Notification', splitedDS[i] + ' is Added to ' + actionOn, 'top right', 'fadeIn', 'fadeOut');

            var dataToStore = {
                messageType: "Forum",
                sender: sender,
                message: comment,
                time: senderTime,
                sendTo: bbName
            }
            notification_functions.updateNotificationHeaderInstant('Forum', sender, bbName, timeFromSender, messageReceived);
            notification_functions.storeDataForNotificationHeader(dataToStore);

            break;
        }
        case "delete": {
            var units = notificationData.units;
            var splitedDS = units.split(",");
            var actionOn = notificationData.actionOn;
            for (var i = 0; i < splitedDS.length; i++)
                extras.lobiNotification('info', 'Notification', splitedDS[i] + ' is Released from ' + actionOn, 'top right', 'fadeIn', 'fadeOut');

            var dataToStore = {
                messageType: "Forum",
                sender: sender,
                message: comment,
                time: senderTime,
                sendTo: bbName
            }
            notification_functions.updateNotificationHeaderInstant('Forum', sender, bbName, timeFromSender, messageReceived);
            notification_functions.storeDataForNotificationHeader(dataToStore);

            break;
        }
    }

}