const xmpp = require('simple-xmpp');
const properties = require('../data/Properties');
const chatRoomDataL = require('../data/loginObject').CHATROOM_DATA;
const chatSchema = require('../database/schema/chatSchema').chatMessageModel;
const chatService = require('../Services/chatService');
const extras = require('../Services/helperService');

//Exposing Required Functionalities Outside this File.
module.exports = {
    connectToChatServer
}

//XMPP Server Subscriber
function connectToChatServer(username, password, SERVER_IP, XMPP_DOMAIN) {
    console.log(SERVER_IP);
    xmpp.connect({
        jid: username + '@' + XMPP_DOMAIN,
        password: password,
        host: SERVER_IP,
        port: 5222
    });
    xmpp.on('online', async (data) => {
        console.log('I am Online Now ' + data.jid);
        await joinTheRooms();
    });
    xmpp.on('chat', async (fromR, messageR) => {
        var from = fromR.split('@')[0];
        var messageC = extras.decryptData(messageR);
        var message = JSON.parse(JSON.stringify(messageC));
        var chatQuery = {
            userName: properties.USERNAME,
            chatUser: from
        }

        var isUserInDatabase = await chatService.findIfChatUserExists(chatQuery);
        if (!isUserInDatabase) {
            var chatDataStore = {
                userName: properties.USERNAME,
                chatUser: from,
                messages: []
            }
            await chatService.makeNewChatUserInDatabase(chatDataStore);
        }

        var chatDataStructureReceived = JSON.parse(message);
        // { type:"chat","reply": false, "normal": true, "message": "123456", "sender": "RANA_SCO", "time": "29/1/2019 at 9:32:19", "repliedTo": "" }
        //  console.log(chatDataStructureReceived);
        switch (chatDataStructureReceived.type) {
            case "chat":
                await chatService.handleReceivedChatData(chatDataStructureReceived, from);
                break;
            case "ack":
                await chatService.handleAckChatData(chatDataStructureReceived, from);
                break;
        }

    });

    xmpp.on('chatstate', function (from, state) {
        console.log('% is currently %s', from, state);
    });

    xmpp.on('close', () => {
        xmpp.disconnect();
        var onlineUserAreaIchat = document.getElementById('onlineUsersAreaForIChat');
        setTimeout(() => {
            xmpp.connect({
                jid: username + '@' + XMPP_DOMAIN,
                password: password,
                host: SERVER_IP,
                port: 5222
            });
        }, 4000);
    });

    xmpp.on('buddy', async (jid, state, statusText, resource) => {
        var from = jid.split('@')[0];
        if (jid.split('@')[1] != properties.XMPP_CONFERENCE_DOMAIN) {
            if (from.toUpperCase() !== properties.USERNAME.toUpperCase())
                await chatService.displayOnlineUserInIChat(jid, state);
            var chatQuery = {
                userName: properties.USERNAME,
                chatUser: from
            }
            var isUserInDatabase = await chatService.findIfChatUserExists(chatQuery);
            if (!isUserInDatabase) {
                var chatDataStore = {
                    userName: properties.USERNAME,
                    chatUser: from,
                    messages: []
                }
                await chatService.makeNewChatUserInDatabase(chatDataStore);
            }
        }
    });

    xmpp.on('error', (error) => {
        messageLobi = '<i><h4>Chat Service Not Reachable</h4></i>';
        // extras.lobiNotification('error', 'Chat', messageLobi, 'top left', 'fadeIn', 'fadeOut');
        //     var onlineUserAreaIchat = document.getElementById('onlineUsersAreaForIChat');
    });


    xmpp.on('groupchat', async (conference, from, message, stamp) => {
        var messageReceived = JSON.parse(message);
        var messageRec = extras.decryptData(messageReceived.message);
        messageReceived.message = messageRec;
        var me = false;
        if (messageReceived.sender.toUpperCase() == properties.USERNAME.toUpperCase())
            me = true;
        var roomName = conference.split('@')[0];
        if (messageReceived.repliedTo != '') {
            messageReceived.repliedTo.message = extras.decryptData(messageReceived.repliedTo.message);
        }

        if (!me)
            await chatService.handleChatRoomMessageReceived(roomName, messageReceived, me);


        messageReceived.message = messageRec;

        messageReceived.me = me;
        await chatService.storeChatRoomMessageinLocalStorage(roomName, messageReceived);
    });

    xmpp.getRoster();

}

//XMPP Server Disconnect
function disconnectXMPP() {
    xmpp.disconnect();
}

//Service to Join the ChatRoom at Start
function joinTheRooms() {
    return new Promise((resolve, reject) => {
        var nickName = properties.USERNAME;
        var xmpp_conference = properties.XMPP_CONFERENCE_DOMAIN;
        var password = properties.CHAT_ROOM_PASSSWORD;
        for (var i = 0; i < chatRoomDataL.length; i++) {
            var roomName = chatRoomDataL[i].roomName;
            var room_resource = roomName + "@" + xmpp_conference + "/" + nickName;
            xmpp.join(room_resource, password);
        }
        resolve(true);
    })
}