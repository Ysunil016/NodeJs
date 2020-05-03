const xmpp = require('simple-xmpp');
var arrayOfSelectedChats = [];
const properties = require('../data/Properties');
const chatSchema = require('../database/schema/chatSchema').chatMessageModel;
const extras = require('./helperService');
const username = require('../data/Properties').USERNAME;
const chatRoomDataL = require('../data/loginObject').CHATROOM_DATA;
const notificationService = require('../Services/notificationService');
const dashboardService = require('../Services/dashboardService');

//Exposing Required Functionalities Outside this File.
module.exports = {
    openChatWindow,
    sendChatMessageToServer,
    selectSingleChat,
    replyButtonClicked,
    backToNormal,
    sendChatMessageAsReply,
    deleteChatButton,
    forwardButtoninChat,

    openChatRoomWindow,
    sendingNormalChatRoomMessage,
    chatRoomReplyButtonClicked,
    sendNormalRoomMessageToReply,
    openUserList,

    sendingMessageIChat,
    openActiveIChatUser,
    displayOnlineUserInIChat,



    handleReceivedChatData,
    handleAckChatData,
    findIfChatUserExists,
    makeNewChatUserInDatabase,

    handleChatRoomMessageReceived,
    storeChatRoomMessageinLocalStorage,

    makeChatRoominLocalStorage,

    updateUIForCheckedStatus
}





//Chat Service for Chat View Handler and Controller
function openChatWindow(chatUser) {
    return new Promise(async (resolve, reject) => {
        resetChatWindow();
        chatUser = chatUser.toLowerCase();
        var chatQuery = {
            userName: username,
            chatUser: chatUser
        }

        var userData = await findChatMessage(chatQuery, chatUser);
        var chatAreaTemplate = $('#chatConversationArea').html()
        var chatAreaTemplateCompile = Handlebars.compile(chatAreaTemplate)
        $('.chatConversationArea').html(chatAreaTemplateCompile(userData))
        document.getElementById('chatInConversationArea').innerText = chatUser.toUpperCase();
        document.getElementById('ChatSectionForScroll' + chatUser).scrollTop = document.getElementById('ChatSectionForScroll' + chatUser).scrollHeight
        await sendACKForChatToServer(chatUser, 2);
        resolve(true);
    })
}

//Chat Service to Send Data to Server Over API
function sendChatMessageToServer(sendTo) {
    return new Promise((resolve, reject) => {
        var messageEntered = document.getElementById('chatMessage' + sendTo).value;
        document.getElementById('chatMessage' + sendTo).value = '';
        var currentTime = extras.getCurrrentTime();

        var dataToSendOverXMPP = {
            type: "chat",
            reply: false,
            normal: true,
            message: messageEntered,
            sender: username,
            time: currentTime,
            repliedTo: ''
        };



        var dataRecOverXMPPEnc = extras.encryptData(JSON.stringify(dataToSendOverXMPP));

        console.log(dataRecOverXMPPEnc.length);

        //Sending CHAT MESSAGE VIA XMPP
        fetch('http://' + properties.SERVER_IP + ':' + properties.XMPP_PRESENCE_PORT + '/plugins/presence/status?jid=' + username + '@' + properties.XMPP_DOMAIN + '&type=text')
            .then(res => res.text())
            .then(async data => {
                var mValue = data.match(/offline/);
                var value = !(null === data);
                if (mValue) {
                    //ReconnectToChat

                } else {
                    xmpp.send(sendTo + '@' + properties.XMPP_DOMAIN, dataRecOverXMPPEnc, false);
                    await updateChatPanelScreen(username, sendTo, messageEntered, currentTime);
                }
                resolve(true);
            });

        resolve(true);
    })
}

//Chat Service to Remove All Selections from Chat Window
function resetChatWindow() {
    arrayOfSelectedChats = [];
}

//Chat Service to Fetch All Chat Messages from MongoDB from ChatUser and Username
function findChatMessage(chatQuery, chatUser) {
    return new Promise((resolve, reject) => {
        chatSchema.findOne(chatQuery).then(async resp => {
            if (resp)
                resolve(resp);
            else {
                resp = await makeNewChatEntryInDatabase(username, chatUser);
                resolve(resp);
            }
        })
    })
}

//Chat Service to Make Entry MongoDB for ChatUser with Username
function makeNewChatEntryInDatabase(username, chatUser) {
    return new Promise((resolve, reject) => {
        var data2Store = {
            userName: username,
            chatUser: chatUser,
            messages: []
        }
        new chatSchema(data2Store).save().then(resp => {
            resolve(data2Store);
        }).catch(errp => {
            resolve({});
        })
    })
}

//Chat Service to Send ACK for ChatUser to Server Over API
function sendACKForChatToServer(chatUser, ackType) {
    return new Promise((resolve, reject) => {
        var dataToSend = {
            type: "ack",
            user: username,
            status: ackType
        }
        dataToSend = extras.encryptData(JSON.stringify(dataToSend));
        if (connectionIsLive()) {
            xmpp.send(chatUser + '@' + properties.XMPP_DOMAIN, dataToSend, false);
        }
        resolve(true);
    })
}

//Chat Service to Update UI for Messages Received or Send in Chat.
function updateChatPanelScreen(username, sendTo, messageEntered, time) {
    return new Promise(async (resolve, reject) => {
        var MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + sendTo);
        var ICHAT_WINDOW = document.getElementById('iChatContentForScroll_' + sendTo);
        var getMessageUUID = extras.getUUID();
        if (MAIN_CHAT_WINDOW !== null) {
            l1 = document.createElement('li');
            l1.setAttribute('id', 'entireChat' + getMessageUUID);
            div1 = document.createElement('div');
            div2 = document.createElement('div');
            i1 = document.createElement('i');
            p1 = document.createElement('p');
            i2 = document.createElement('i');
            i3 = document.createElement('i');
            l1.className = "clearfix odd";
            div1.className = "conversation-text";
            div2.className = "ctext-wrap";
            // div2.setAttribute('id','1233');
            div2.setAttribute('id', getMessageUUID);
            div2.setAttribute('onclick', "chatSelected('" + getMessageUUID + "','true')");
            i1.innerText = username.toUpperCase();
            i1.style = 'display:none'
            p1.innerText = messageEntered;
            i2.className = "dateTime";
            i2.innerText = time;
            i3.className = "single_check";
            i3.innerHTML = "&#10003"

            MAIN_CHAT_WINDOW.appendChild(l1);
            l1.appendChild(div1);
            div1.appendChild(div2);
            div2.appendChild(i1);
            div2.appendChild(p1);
            div2.appendChild(i2);
            div2.appendChild(i3);

            //Scroll Down
            MAIN_CHAT_WINDOW.scrollTop = MAIN_CHAT_WINDOW.scrollHeight;
        }

        if (ICHAT_WINDOW !== null) {
            var div1 = document.createElement('div');
            div1.className = "author-chat";
            var h3 = document.createElement('h3');
            h3.innerText = username.toUpperCase();
            var div2 = document.createElement('div');
            div2.className = "row"
            div2.innerText = messageEntered;
            var label = document.createElement('label');
            label.className = "chat_time"
            label.innerText = time;
            ICHAT_WINDOW.appendChild(div1);
            div1.appendChild(h3);
            div1.appendChild(div2);
            div2.appendChild(label);

            //HANDLING SCROLL for ICHAT AREA
            ICHAT_WINDOW.scrollTop = ICHAT_WINDOW.scrollHeight;
        }

        var dataToPush = {
            $push: {
                messages: {
                    me: true,
                    reply: false,
                    read: false,
                    delivered: false,
                    normal: true,
                    uuid: getMessageUUID,
                    sender: username.toUpperCase(),
                    message: messageEntered,
                    time: time,
                    repliedTo: null
                }
            }
        }
        var chatQuery = {
            userName: username,
            chatUser: sendTo
        };

        var isStored = await storeChatMessageToDatabase(chatQuery, dataToPush);
        resolve(isStored);
    })
}

//Chat Service to Store Chat Messages in MongoDB.
function storeChatMessageToDatabase(query, data) {
    return new Promise((resolve, reject) => {
        chatSchema.update(query, data).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    });
}

//Chat Service to Health Check
function connectionIsLive() {

    //     xmpp.probe(username+"@"+properties.XMPP_DOMAIN, function(state) {
    //     console.log(state);
    //     return true;
    // });
    return true;
}

//Chat Service for Chat Selection from ChatScreen
function selectSingleChat(id, me) {
    return new Promise((resolve, reject) => {
        document.getElementById(id).style = "background-color:#31ccbd !important";
        document.getElementById('replyForwardDeleteHeaderInChat').style = "display:block"

        if (checkForAlreadyExistingInArray(arrayOfSelectedChats, id, me)) {} else {
            arrayOfSelectedChats.push(id);
        }

        if (arrayOfSelectedChats.length === 0)
            document.getElementById('replyForwardDeleteHeaderInChat').style = "display:none"
        if (arrayOfSelectedChats.length > 1)
            document.getElementById('chatReplyButton').style = "display:none"
        else
            document.getElementById('chatReplyButton').style = "display:inline"
    })
}

//Chat Service for Checking if Chat Message is Selected in Buffer
function checkForAlreadyExistingInArray(arrayOfSelectedChats, uuid, me) {
    for (i = 0; i < arrayOfSelectedChats.length; i++) {
        if (arrayOfSelectedChats[i] == uuid) {
            arrayOfSelectedChats.splice(i, 1);
            if (me === 'false')
                document.getElementById(uuid).style = "background-color:#303030 !important"
            else
                document.getElementById(uuid).style = "background-color:#3a4e5a !important"
            return true
        }
    }
    return false
}

//Chat Service to Reply Option in Chat Window
function replyButtonClicked(messageToReply) {
    return new Promise((resolve, reject) => {

        if (document.getElementById('chatToReplyIsSelected') !== null)
            document.getElementById('chatToReplyIsSelected').remove();
        var idSelectedChat = arrayOfSelectedChats
        var chatInputBar = document.getElementById('userReplyDirectChatInputArea');
        var selectedChatData = document.getElementById(idSelectedChat);

        // console.log(selectedChatData.childNodes);
        // if(selectedChatData.childNodes[5]!=undefined)
        // if(selectedChatData.childNodes[5].className == "single_check"){
        //     selectedChatData.childNodes[5].remove();
        // }

        selectedChatData = selectedChatData.innerHTML;

        var replyElement = document.createElement('div');
        var exitReplyTab = document.createElement('div');
        exitReplyTab.className = "exitReplyTabCrossButton";
        exitReplyTab.setAttribute('onclick', 'backToNormal("' + messageToReply + '",true)');
        exitReplyTab.setAttribute('id', 'exitReplyChatButton');
        var exitButtonReplyTab_i = document.createElement('i');
        exitButtonReplyTab_i.className = "fa fa-close"
        exitReplyTab.appendChild(exitButtonReplyTab_i);

        replyElement.innerHTML = selectedChatData;
        replyElement.setAttribute('id', 'chatToReplyIsSelected');
        chatInputBar.appendChild(exitReplyTab);
        chatInputBar.appendChild(replyElement)

        var inputSectionForReply = document.getElementById('chatMessage' + messageToReply);
        inputSectionForReply.setAttribute('placeholder', 'Reply......');
        var sendButtonSectionForReply = document.getElementById('sendChatButton');
        sendButtonSectionForReply.setAttribute('onclick', "sendDirectMessageToReply('" + messageToReply + "','" + idSelectedChat + "')");

        //  BACK To NORMAL
        document.getElementById(idSelectedChat).style = "";
        document.getElementById('replyForwardDeleteHeaderInChat').style = "display:none"
        arrayOfSelectedChats = [];
        resolve(true);
    })
}

//Chat Service to Make Screen Back to Normal After Reply is Done/Exited
function backToNormal(sendReplyTo, isDirect) {
    return new Promise((resolve, reject) => {
        if (document.getElementById('chatToReplyIsSelected') !== null)
            document.getElementById('chatToReplyIsSelected').remove();
        if (document.getElementById('exitReplyChatButton') !== null)
            document.getElementById('exitReplyChatButton').remove();

        // console.log(sendReplyTo)
        var inputSectionForReply = document.getElementById('chatMessage' + sendReplyTo);
        if (inputSectionForReply) {
            inputSectionForReply.value = "";
            inputSectionForReply.setAttribute('placeholder', 'Enter Text Message');
        }
        var inputSectionForReplyRoom = document.getElementById('chatRoomMessage' + sendReplyTo);
        if (inputSectionForReplyRoom) {
            inputSectionForReplyRoom.value = "";
            inputSectionForReplyRoom.setAttribute('placeholder', 'Enter Text Message');
        }


        var sendButtonForDirectChat = document.getElementById('sendChatButton');
        // sendButtonForDirectChat.setAttribute('onclick', "sendingDirectChatMessage('" + sendReplyTo + "')");

        if (isDirect)
            sendButtonForDirectChat.setAttribute('onclick', "sendingDirectChatMessage('" + sendReplyTo + "')");
        else
            sendButtonForDirectChat.setAttribute('onclick', "sendingChatRoomMessage('" + sendReplyTo + "')");

        resolve(true);
    })
}

//Chat Service to Send Reply Message to Server Over API
function sendChatMessageAsReply(sendReplyTo, idSelected) {
    return new Promise(async (resolve, reject) => {
        var messageReply = document.getElementById('chatMessage' + sendReplyTo).value;
        var selectedChatRegion = document.getElementById(idSelected);
        var selectedChatRegionChild = selectedChatRegion.childNodes;
        var currentTime = extras.getCurrrentTime();


        if ((selectedChatRegionChild[3] == undefined) || (selectedChatRegionChild[3].className == 'single_check')) {
            var senderReplyTo = selectedChatRegionChild[0].innerText;
            var messageReplyTo = selectedChatRegionChild[1].innerText;
            var TimeReplyTo = selectedChatRegionChild[2].innerText;
        } else {
            var senderReplyTo = selectedChatRegionChild[1].innerText;
            var messageReplyTo = selectedChatRegionChild[3].innerText;
            var TimeReplyTo = selectedChatRegionChild[5].innerText;
        }


        var dataToSendOverXMPP = {
            type: "chat",
            reply: true,
            normal: false,
            message: messageReply,
            sender: username,
            time: currentTime,
            repliedTo: {
                sender: senderReplyTo,
                message: messageReplyTo,
                time: TimeReplyTo
            }
        };
        var dataRecOverXMPPEnc = extras.encryptData(JSON.stringify(dataToSendOverXMPP));

        //Sending CHAT MESSAGE VIA XMPP
        xmpp.send(sendReplyTo + '@' + properties.XMPP_DOMAIN, dataRecOverXMPPEnc, false);
        await updateReplyChatPanelScreen(senderReplyTo, messageReplyTo, TimeReplyTo, username, messageReply, sendReplyTo);
        await backToNormal(sendReplyTo, true);
        arrayOfSelectedChats.slice();
    })
}

//Chat Service to Update Reply Message Sent over UI.
function updateReplyChatPanelScreen(replySender, replyMessage, replyTime, username, messageToSend, sendTo) {
    return new Promise((resolve, reject) => {
        var getMessageUUID = extras.getUUID();
        var MAIN_CHAT_WINDOW = document.getElementById('chatInConversationArea').innerText;
        var ICHAT_WINDOW = document.getElementById('iChatContentForScroll_' + sendTo.toLowerCase());
        if (MAIN_CHAT_WINDOW !== null) {

            var mainArea = document.getElementById('ChatSectionForScroll' + MAIN_CHAT_WINDOW.toLowerCase());
            var li1 = document.createElement('li');
            li1.setAttribute('id', 'entireChat' + getMessageUUID);
            li1.className = "clearfix odd"
            var div0 = document.createElement('div');
            div0.className = "conversation-text";
            var div1 = document.createElement('div');
            div1.className = "ctext-wrap"
            div1.setAttribute('onclick', "chatSelected('" + getMessageUUID + "','true')");
            var div2 = document.createElement('div');
            div2.className = "replySendSection"
            var span1 = document.createElement('span')
            var div3 = document.createElement('div');
            span1.className = "replySender"
            span1.innerText = replySender
            var span2 = document.createElement('span')
            span2.className = "replyMessage"
            span2.innerText = replyMessage
            var span3 = document.createElement('span')
            span3.className = "replyTime"
            span3.innerText = replyTime
            var i1 = document.createElement('i')
            i1.className = "meAsSender"
            i1.innerText = username
            var p1 = document.createElement('p')
            p1.innerText = messageToSend
            var i3 = document.createElement('i');
            i3.className = "single_check";
            i3.innerHTML = "&#10003";
            var i2 = document.createElement('i')
            i2.innerText = extras.getCurrrentTime();
            div3.setAttribute('id', getMessageUUID);

            mainArea.appendChild(li1);
            li1.appendChild(div0);
            div0.appendChild(div1);
            div1.appendChild(div2);
            div2.appendChild(span1);
            div2.appendChild(span2);
            div2.appendChild(span3);
            div1.append(div3);
            div3.appendChild(i1);
            div3.appendChild(p1);
            div3.appendChild(i2);
            div3.appendChild(i3);

            document.getElementById('ChatSectionForScroll' + MAIN_CHAT_WINDOW.toLowerCase()).scrollTop = document.getElementById('ChatSectionForScroll' + MAIN_CHAT_WINDOW.toLowerCase()).scrollHeight;
        }
        // console.log(ICHAT_WINDOW);

        if (ICHAT_WINDOW !== null) {

            var div1 = document.createElement('div');
            div1.className = "author-chat iChatSendReplySection"
            var h31 = document.createElement('h3');
            h31.innerText = replySender
            var div2 = document.createElement('div');
            div2.className = "row"
            div2.innerText = replyMessage
            var label1 = document.createElement('label');
            label1.className = "chat_time"
            label1.innerText = replyTime
            var span1 = document.createElement('span');
            span1.className = "messageData"
            var i1 = document.createElement('i');
            i1.className = "messageSender"
            i1.innerText = username
            var i2 = document.createElement('i');
            i2.className = "message"
            i2.innerText = messageToSend
            var i3 = document.createElement('i');
            i3.className = "messageTime"
            i3.innerText = extras.getCurrrentTime();

            ICHAT_WINDOW.appendChild(div1);
            div1.appendChild(h31);
            div1.appendChild(div2);
            div2.appendChild(label1)
            div2.appendChild(span1);
            span1.appendChild(i1);
            span1.appendChild(i2);
            span1.appendChild(i3);

            ICHAT_WINDOW.scrollTop = ICHAT_WINDOW.scrollHeight;

        }

        //STORING MESSAGE IN LOCAL MongoDB DATABASE
        var dataToPush = {
            $push: {
                messages: {
                    me: true,
                    reply: true,
                    normal: false,
                    read: false,
                    delivered: false,
                    sender: username,
                    message: messageToSend,
                    time: extras.getCurrrentTime(),
                    uuid: getMessageUUID,
                    repliedTo: {
                        sender: replySender.toUpperCase(),
                        message: replyMessage,
                        time: replyTime
                    }
                }
            }
        }
        var chatQuery = {
            userName: username,
            chatUser: sendTo
        }
        chatSchema.update(chatQuery, dataToPush).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    })
}

//Chat Service to Deleted Chat Messages Selected
function deleteChatButton(chatUser) {
    return new Promise(async (resolve, reject) => {
        for (i = 0; i < arrayOfSelectedChats.length; i++) {
            document.getElementById('entireChat' + arrayOfSelectedChats[i]).style = "display:none"
            await deleteChatMessageFromLocalDatabase(chatUser, arrayOfSelectedChats[i])
        }
        arrayOfSelectedChats = [];

        if (arrayOfSelectedChats.length === 0)
            document.getElementById('replyForwardDeleteHeaderInChat').style = "display:none"
    })
    resolve(true);
}

//Chat Service to Deleted Chat Messages Selected Messages 
function deleteChatMessageFromLocalDatabase(chatUser, uuid) {
    return new Promise((resolve, reject) => {
        var chatQuery = {
            "chatUser": chatUser.toLowerCase(),
            "userName": username
        }
        chatSchema.update(chatQuery, {
            $pull: {
                messages: {
                    uuid: uuid
                }
            }
        }).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    })
}

//Chat Service for Chat Button Clicked from Chat Window
function forwardButtoninChat(forwardMessageTo) {
    return new Promise(async (resolve, reject) => {
        for (var i = 0; i < arrayOfSelectedChats.length; i++) {
            var message = document.getElementById(arrayOfSelectedChats[i]).children[1].innerText
            var currentActiveUser = document.getElementById('chatInConversationArea').innerText;
            var dataToSendOverXMPP = {
                type: "chat",
                reply: false,
                normal: true,
                message: message,
                sender: username,
                time: extras.getCurrrentTime(),
                repliedTo: ""
            };
            var dataRecOverXMPPEnc = extras.encryptData(JSON.stringify(dataToSendOverXMPP));
            if (currentActiveUser !== forwardMessageTo.toUpperCase()) {
                xmpp.send(forwardMessageTo + '@' + properties.XMPP_DOMAIN, dataRecOverXMPPEnc, false);
                var dataToPush = {
                    $push: {
                        messages: {
                            me: true,
                            reply: false,
                            normal: true,
                            read: false,
                            delivered: false,
                            uuid: extras.getUUID(),
                            sender: username.toUpperCase(),
                            message: message,
                            time: extras.getCurrrentTime(),
                            repliedTo: ''
                        }
                    }
                }
                var chatQuery = {
                    userName: username,
                    chatUser: forwardMessageTo.toLowerCase()
                }
                chatSchema.update(chatQuery, dataToPush).then(resp => {}).catch(resp => {});

            } else {
                await sendingForwardChatMessage(forwardMessageTo.toLowerCase(), dataToSendOverXMPP);
            }

            document.getElementById(arrayOfSelectedChats[i]).style = "";
        }
        arrayOfSelectedChats = [];
        document.getElementById('replyForwardDeleteHeaderInChat').style = "display:none"
        extras.lobiNotification('info', 'Message Forwarded', 'Message Forwarded to :' + forwardMessageTo, 'bottom center', 'bounceIn', 'bounceOut')
        resolve(true);
    })
}

//Chat Service to Send Selected Messages to Server Over API
function sendingForwardChatMessage(sendTo, dataSendOverXMPP) {
    return new Promise(async (resolve, reject) => {
        var currentTime = extras.getCurrrentTime();
        var dataSendOverXMPPT = {
            type: dataSendOverXMPP.type,
            sender: dataSendOverXMPP.sender,
            normal: dataSendOverXMPP.normal,
            reply: dataSendOverXMPP.reply,
            message: dataSendOverXMPP.message,
            time: dataSendOverXMPP.time,
            repliedTo: "",
        };
        var dataRecOverXMPPEnc = extras.encryptData(JSON.stringify(dataSendOverXMPPT));
        xmpp.send(sendTo + '@' + properties.XMPP_DOMAIN, dataRecOverXMPPEnc, false);

        await displaySendingChatMessagesToUI(username, sendTo, dataSendOverXMPP.message, dataSendOverXMPP.time);
        resolve(true);
    })
}

//Chat Service to Display Send Message to Chat Window/IChat Window
function displaySendingChatMessagesToUI(username, sendTo, messageEntered, time) {
    return new Promise((resolve, reject) => {
        var MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + sendTo);
        var ICHAT_WINDOW = document.getElementById('iChatContentForScroll_' + sendTo);
        var getMessageUUID = extras.getUUID();
        if (MAIN_CHAT_WINDOW !== null) {
            l1 = document.createElement('li');
            l1.setAttribute('id', 'entireChat' + getMessageUUID);
            div1 = document.createElement('div');
            div2 = document.createElement('div');
            i1 = document.createElement('i');
            p1 = document.createElement('p');
            i2 = document.createElement('i');
            i3 = document.createElement('i');
            l1.className = "clearfix odd";
            div1.className = "conversation-text";
            div2.className = "ctext-wrap";
            // div2.setAttribute('id','1233');
            div2.setAttribute('id', getMessageUUID);
            div2.setAttribute('onclick', "chatSelected('" + getMessageUUID + "','true')");
            i1.innerText = username.toUpperCase();
            i1.style = 'display:none'
            p1.innerText = messageEntered;
            i2.className = "dateTime";
            i2.innerText = time;
            i3.className = "single_check";
            i3.innerHTML = "&#10003"

            MAIN_CHAT_WINDOW.appendChild(l1);
            l1.appendChild(div1);
            div1.appendChild(div2);
            div2.appendChild(i1);
            div2.appendChild(p1);
            div2.appendChild(i2);
            div2.appendChild(i3);

            //Scroll Down
            MAIN_CHAT_WINDOW.scrollTop = MAIN_CHAT_WINDOW.scrollHeight;
        }

        if (ICHAT_WINDOW !== null) {
            var div1 = document.createElement('div');
            div1.className = "author-chat";
            var h3 = document.createElement('h3');
            h3.innerText = username.toUpperCase();
            var div2 = document.createElement('div');
            div2.className = "row"
            div2.innerText = messageEntered;
            var label = document.createElement('label');
            label.className = "chat_time"
            label.innerText = time;
            ICHAT_WINDOW.appendChild(div1);
            div1.appendChild(h3);
            div1.appendChild(div2);
            div2.appendChild(label);

            //HANDLING SCROLL for ICHAT AREA
            ICHAT_WINDOW.scrollTop = ICHAT_WINDOW.scrollHeight;
        }


        var dataToPush = {
            $push: {
                messages: {
                    me: true,
                    reply: false,
                    read: false,
                    delivered: false,
                    normal: true,
                    uuid: getMessageUUID,
                    sender: username.toUpperCase(),
                    message: messageEntered,
                    time: time,
                    repliedTo: null
                }
            }
        }
        var chatQuery = {
            userName: username,
            chatUser: sendTo
        };
        chatSchema.update(chatQuery, dataToPush).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    });
}

//Chat Service for Opening ChatRoom Window
function openChatRoomWindow(chatRoomName) {
    return new Promise(async (resolve, reject) => {
        resetChatWindow();
        var chatRoomData = await seachChatRoomInObject(chatRoomName, chatRoomDataL);
        var roomData = await getChatRoomMessages(chatRoomName);
        chatRoomData.roomData = roomData;

        try {
            var chatRoomAreaTemplate = $('#chatRoomConversationArea').html()
            var chatRoomAreaTemplateCompile = Handlebars.compile(chatRoomAreaTemplate)
            $('.chatConversationArea').html(chatRoomAreaTemplateCompile(chatRoomData))
            document.getElementById('chatInConversationArea').innerText = chatRoomName.toUpperCase() + " Room";
            document.getElementById('ChatSectionForScroll' + chatRoomName).scrollTop = document.getElementById('ChatSectionForScroll' + chatRoomName).scrollHeight
            resolve(true);
        } catch (e) {
            console.log('Some Error has Occured while Connecting To Local DB' + e)
            resolve(true)
        }
    })

}

//Chat Service to Find Chat Rooms in which Users is Involved
function seachChatRoomInObject(room, object_rec) {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < object_rec.length; i++) {
            if (room == object_rec[i].roomName)
                resolve(object_rec[i]);
        }
        resolve([]);
    })

}

//Chat Service to Find All the Messages Regarding ChatRoom and Username
function getChatRoomMessages(room) {
    return new Promise((resolve, reject) => {
        var chatRoomFile = window.localStorage.getItem('chatRoomData');
        room = room.toLowerCase();
        var json_chat_room = JSON.parse(chatRoomFile);
        if (json_chat_room != null)
            for (var i = 0; i < json_chat_room.length; i++) {
                if (json_chat_room[i].room == room) {
                    resolve(json_chat_room[i].data);
                }
            }
        resolve([]);
    })
}

//Chat Service for Sending Normal ChatRoom Messages to the Server
function sendingNormalChatRoomMessage(room) {
    return new Promise(async (resolve, reject) => {
        var messageEntered = document.getElementById('chatMessage' + room).value;
        document.getElementById('chatMessage' + room).value = '';
        var getUUID = extras.getUUID();

        await displaySendingChatRoomMessagesToUI(properties.USERNAME, room, messageEntered, extras.getCurrrentTime(), getUUID);

        messageEntered = extras.encryptData(messageEntered);
        var dataToSendOverXMPP = {
            type: "chat",
            reply: false,
            uuid: getUUID,
            normal: true,
            message: messageEntered,
            sender: username,
            time: extras.getCurrrentTime(),
            repliedTo: ''
        };
        var dataRecOverXMPPEnc = (JSON.stringify(dataToSendOverXMPP));
        xmpp.send(room + '@' + properties.XMPP_CONFERENCE_DOMAIN, dataRecOverXMPPEnc, true);
    })

}

//Chat Service to Display Message on UI after Sending Message to the Server
function displaySendingChatRoomMessagesToUI(username, sendTo, messageEntered, time, getMessageUUID) {
    return new Promise((resolve, reject) => {
        try {
            MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + sendTo);
            // ICHAT_WINDOW = document.getElementById('iChatContentForScroll_' + sendTo);

            if (MAIN_CHAT_WINDOW !== null) {

                l1 = document.createElement('li');
                l1.setAttribute('id', 'entireChat' + getMessageUUID);
                div1 = document.createElement('div');
                div2 = document.createElement('div');
                i1 = document.createElement('i');
                p1 = document.createElement('p');
                i2 = document.createElement('i');
                l1.className = "clearfix odd";
                div1.className = "conversation-text";
                div2.className = "ctext-wrap";
                // div2.setAttribute('id','1233');
                div2.setAttribute('id', getMessageUUID);
                div2.setAttribute('onclick', "chatSelected('" + getMessageUUID + "','true')");
                i1.innerText = username.toUpperCase();
                i1.style = 'display:none'
                p1.innerText = messageEntered;
                i2.className = "dateTime";
                i2.innerText = time;

                MAIN_CHAT_WINDOW.appendChild(l1);
                l1.appendChild(div1);
                div1.appendChild(div2);
                div2.appendChild(i1);
                div2.appendChild(p1);
                div2.appendChild(i2);

                //Scroll Down
                MAIN_CHAT_WINDOW.scrollTop = MAIN_CHAT_WINDOW.scrollHeight;
            }
            resolve(true);
        } catch (e) {
            resolve(true)
        }


    })

}

//Chat Service to Handle Reply Button Clicked on ChatRoom
function chatRoomReplyButtonClicked(replyMessageTo) {
    return new Promise((resolve, reject) => {
        try {
            if (document.getElementById('chatToReplyIsSelected') !== null)
                document.getElementById('chatToReplyIsSelected').remove();

            var idSelectedChat = arrayOfSelectedChats
            var chatInputBar = document.getElementById('userReplyDirectChatInputArea');
            var selectedChatData = document.getElementById(idSelectedChat).innerHTML;
            var replyElement = document.createElement('div');
            var exitReplyTab = document.createElement('div');
            exitReplyTab.className = "exitReplyTabCrossButton";
            exitReplyTab.setAttribute('onclick', 'backToNormal("' + replyMessageTo + '",false)');
            exitReplyTab.setAttribute('id', 'exitReplyChatButton');
            var exitButtonReplyTab_i = document.createElement('i');
            exitButtonReplyTab_i.className = "fa fa-close"
            exitReplyTab.appendChild(exitButtonReplyTab_i);

            replyElement.innerHTML = selectedChatData;
            replyElement.setAttribute('id', 'chatToReplyIsSelected');
            chatInputBar.appendChild(exitReplyTab);
            chatInputBar.appendChild(replyElement)

            var inputSectionForReply = document.getElementById('chatMessage' + replyMessageTo);
            inputSectionForReply.setAttribute('placeholder', 'Reply......');
            var sendButtonSectionForReply = document.getElementById('sendChatButton');
            sendButtonSectionForReply.setAttribute('onclick', "sendDirectRoomMessageToReply('" + replyMessageTo + "','" + idSelectedChat + "')");

            //  BACK To NORMAL
            document.getElementById(idSelectedChat).style = "";
            document.getElementById('replyForwardDeleteHeaderInChat').style = "display:none"
            arrayOfSelectedChats = [];
            resolve(true);
        } catch (e) {
            resolve(true);
        }
    })

}

//Chat Service to Send Reply to Chat Message
function sendNormalRoomMessageToReply(sendReplyTo, idSelected) {
    return new Promise(async (resolve, reject) => {
        try {
            var messageReply = document.getElementById('chatMessage' + sendReplyTo).value;
            var selectedChatRegion = document.getElementById(idSelected);
            var selectedChatRegionChild = selectedChatRegion.childNodes;


            if (selectedChatRegionChild[3] == undefined) {
                var senderReplyTo = selectedChatRegionChild[0].innerText;
                var messageReplyTo = selectedChatRegionChild[1].innerText;
                var TimeReplyTo = selectedChatRegionChild[2].innerText;
            } else {
                var senderReplyTo = selectedChatRegionChild[1].innerText;
                var messageReplyTo = selectedChatRegionChild[3].innerText;
                var TimeReplyTo = selectedChatRegionChild[5].innerText;
            }

            await updateUIForReplyInChatRoomArea(username, messageReplyTo, TimeReplyTo, username, messageReply, sendReplyTo);

            var messageUUID = extras.getUUID();
            messageReply = extras.encryptData(messageReply);
            messageReplyTo = extras.encryptData(messageReplyTo);

            var dataToSendOverXMPP = {
                type: "chat",
                reply: true,
                normal: false,
                uuid: messageUUID,
                message: messageReply,
                sender: username,
                time: extras.getCurrrentTime(),
                repliedTo: {
                    sender: senderReplyTo,
                    message: messageReplyTo,
                    time: TimeReplyTo
                }
            };
            var dataRecOverXMPPEnc = (JSON.stringify(dataToSendOverXMPP));
            xmpp.send(sendReplyTo + '@' + properties.XMPP_CONFERENCE_DOMAIN, dataRecOverXMPPEnc, true);
            backToNormal(sendReplyTo, false);
            arrayOfSelectedChats.slice();
            resolve(true);
        } catch (e) {
            console.log(e)
            resolve(true);
        }
    })


}

//Chat Service to Update UI for Chat Message in ChatRoom
function updateUIForReplyInChatRoomArea(replySender, replyMessage, replyTime, username, messageToSend, sendTo) {
    return new Promise((resolve, reject) => {
        try {
            var getMessageUUID = extras.getUUID();
            var MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + sendTo);
            var ICHAT_WINDOW = document.getElementById('iChatContentForScroll_' + sendTo);
            if (MAIN_CHAT_WINDOW !== null) {
                var li1 = document.createElement('li');
                li1.setAttribute('id', 'entireChat' + getMessageUUID);
                li1.className = "clearfix odd"
                var div0 = document.createElement('div');
                div0.className = "conversation-text";
                var div1 = document.createElement('div');
                div1.className = "ctext-wrap"
                div1.setAttribute('onclick', "chatSelected('" + getMessageUUID + "','true')");
                var div2 = document.createElement('div');
                div2.className = "replySendSection"
                var span1 = document.createElement('span')
                var div3 = document.createElement('div');
                span1.className = "replySender"
                span1.innerText = replySender
                var span2 = document.createElement('span')
                span2.className = "replyMessage"
                span2.innerText = replyMessage
                var span3 = document.createElement('span')
                span3.className = "replyTime"
                span3.innerText = replyTime
                var i1 = document.createElement('i')
                i1.className = "meAsSender"
                i1.innerText = username
                var p1 = document.createElement('p')
                p1.innerText = messageToSend
                var i2 = document.createElement('i')
                i2.innerText = extras.getCurrrentTime();
                div3.setAttribute('id', getMessageUUID);

                MAIN_CHAT_WINDOW.appendChild(li1);
                li1.appendChild(div0);
                div0.appendChild(div1);
                div1.appendChild(div2);
                div2.appendChild(span1);
                div2.appendChild(span2);
                div2.appendChild(span3);
                div1.append(div3);
                div3.appendChild(i1);
                div3.appendChild(p1);
                div3.appendChild(i2);
                document.getElementById('ChatSectionForScroll' + sendTo).scrollTop = document.getElementById('ChatSectionForScroll' + sendTo).scrollHeight;
            }
            resolve(true);
        } catch (e) {
            resolve(true);

        }


    })

    backToNormal(sendTo, false);

}

//Chat Service to Open User's List
function openUserList() {
    return new Promise((resolve, reject) => {
        var users = JSON.parse(window.localStorage.getItem('listOfAllUsers'));
        if (!users)
            users = [];
        var listOfAllUsersToForwardMessage = document.getElementById('listOfAllUsersToForwardMessage');
        listOfAllUsersToForwardMessage.innerHTML = ""
        if (listOfAllUsersToForwardMessage !== null) {
            for (i = 0; i < users.length; i++) {
                if (users[i] !== username) {
                    var li = document.createElement('li');
                    var a = document.createElement('a');
                    a.innerText = users[i];
                    li.setAttribute('onclick', "forwardButtonClicked('" + users[i] + "')")
                    li.appendChild(a)
                    listOfAllUsersToForwardMessage.appendChild(li);
                }
            }
        }
        resolve(true);
    })

}





//Chat Service to Send Chat Message from iChat
function sendingMessageIChat(sendTo) {
    return new Promise(async (resolve, reject) => {
        try {
            var messageToSend = document.getElementById('messageTypedInIChatBar').value;
            document.getElementById('messageTypedInIChatBar').value = "";
            var dataToSendOverXMPP = {
                type: "chat",
                reply: false,
                normal: true,
                message: messageToSend,
                sender: properties.USERNAME,
                time: extras.getCurrrentTime(),
                repliedTo: ''
            };
            var dataRecOverXMPPEnc = extras.encryptData(JSON.stringify(dataToSendOverXMPP));
            xmpp.send(sendTo + '@' + properties.XMPP_DOMAIN, dataRecOverXMPPEnc, false);
            await displaySendingChatMessagesToUI(properties.USERNAME, sendTo, messageToSend, extras.getCurrrentTime());
            resolve(true);
        } catch (e) {
            console.log(e);
            resolve(true);
        }
    })


}

//Chat Service to Open List of Active Chat Users in iChat
function openActiveIChatUser(onlineUserR) {
    return new Promise(async (resolve, reject) => {
        try {
            var onlineUser = onlineUserR.split('@');
            var onlyOnlineUsername = onlineUser[0];
            document.getElementById('clickedOnlineUser').innerText = onlyOnlineUsername.toUpperCase();
            var chatQuery = {
                userName: properties.USERNAME,
                chatUser: onlyOnlineUsername
            }
            var chatMessages = await findChatMessage(chatQuery, onlyOnlineUsername);

            var templateToChatRendering = $('#templateForIChat').html()
            var compileToChatRendering = Handlebars.compile(templateToChatRendering)
            $('.iChatAreaHere').html(compileToChatRendering(chatMessages))

            iChatAreaForOnlineUser = document.getElementById('iChatContentForScroll_' + onlyOnlineUsername)
            iChatAreaForOnlineUser.scrollTop = iChatAreaForOnlineUser.scrollHeight;
            resolve(true);
        } catch (e) {
            console.log(e);
            resolve(true);
        }
    })


}

//Chat Service to Display Active Chat Users in iChat
function displayOnlineUserInIChat(from, state) {
    return new Promise((resolve, reject) => {
        try {
            var onlineUserToDisplay = from.split('@');
            if (state === 'online') {
                var onlineUserAreaIchat = document.getElementById('onlineUsersAreaForIChat');
                var a1 = document.createElement('a');
                a1.className = "dropdown-item";
                a1.setAttribute('onclick', 'onlineClickedUsers("' + from + '")');
                a1.innerHTML = onlineUserToDisplay[0].toUpperCase() + ' &nbsp';
                a1.setAttribute('id', from);
                var i1 = document.createElement('i');
                i1.style = "color:green"
                i1.className = "fa fa-dot-circle-o";

                onlineUserAreaIchat.appendChild(a1);
                a1.appendChild(i1);
            } else if (state === 'offline') {
                var onlineUserDisplay = document.getElementById(from);
                if (onlineUserDisplay !== null)
                    onlineUserDisplay.remove();
            }
            resolve(true);
        } catch (e) {
            resolve(true);
        }
    })

}




//Chat Service to Make Container in LocalStorage for Respective ChatRoom at Application Launch
function makeChatRoominLocalStorage() {
    return new Promise((resolve, reject) => {
        var rooms = chatRoomDataL;
        var room_chat_objects = [];
        for (var i = 0; i < rooms.length; i++) {
            var roomName = rooms[i].roomName.toLowerCase();
            var toStore = {
                room: roomName,
                data: []
            }
            room_chat_objects.push(toStore);
        }
        room_chat_objects = JSON.stringify(room_chat_objects);
        window.localStorage.setItem('chatRoomData', room_chat_objects);
        resolve(true);
    })

}


//Chat Service to Handle Received Payload Message from OpenFire Server
function handleReceivedChatData(chatDataStructureReceived, from) {
    return new Promise(async (resolve, reject) => {
        try {
            var reply = chatDataStructureReceived.reply;
            var normal = chatDataStructureReceived.normal;
            var message = chatDataStructureReceived.message;
            var messageSender = chatDataStructureReceived.sender;
            var messageTime = chatDataStructureReceived.time;
            var repliedTo = chatDataStructureReceived.repliedTo;

            dashboardService.updateRecentActivityDashboard('Chat', from, properties.USERNAME, message, extras.getCurrrentTime());
            console.log(chatDataStructureReceived);
            //Display CHAT MESSAGE TO USER
            if (normal == true)
                await displayNormalReceivedChatMessagesToUI(from, message);
            if (reply == true)
                await displayReplyReceivedChatMessagesToUI(from, chatDataStructureReceived);

            var dataToStore = {
                messageType: 'Chat',
                sender: messageSender,
                message: message,
                time: messageTime,
                sendTo: properties.USERNAME
            }
            notificationService.storeNotificationDataInLocalStorage(dataToStore);
            resolve(true);
        } catch (e) {
            console.log(e);
            resolve(true);
        }

    })
}

//Chat Service to Handle Received Payload Acknowledgment from OpenFire Server
function handleAckChatData(chatDataStructureReceived, from) {
    return new Promise(async (resolve, reject) => {

        var to = chatDataStructureReceived.user;
        var personOnWindow = document.getElementById('ChatSectionForScroll' + from);
        var status = chatDataStructureReceived.status;
        if (personOnWindow) {
            await updateUIForCheckedStatus(personOnWindow, status);
        }
        await updateDatabaseForCheckedStatus(to, status);
        resolve(true);
    })

}











//Chat Service to Check if ChatUser Exists in Mongo Database
function findIfChatUserExists(chatQuery) {
    return new Promise((resolve, reject) => {
        chatSchema.findOne(chatQuery).then(resp => {
            if (resp)
                resolve(true);
            else
                resolve(false)
        }).catch(e => {
            console.log(e);
            resolve(true);
        })
    })
}

//Chat Service to Make Schema for ChatUser in Mongo Database
function makeNewChatUserInDatabase(chatData) {
    return new Promise((resolve, reject) => {
        new chatSchema(chatData).save().then(resp => {
            resolve(true);
        }).catch(e => {
            console.log(e);
            resolve(true);
        })
    })
}

//Chat Service to Handle Payload Received as ChatRoom Message from Openfire Server
function handleChatRoomMessageReceived(roomName, messageReceived, me) {
    return new Promise(async (resolve, reject) => {
        if (messageReceived.normal) {
            var dataToPush = {
                me: me,
                reply: messageReceived.reply,
                normal: messageReceived.normal,
                uuid: messageReceived.uuid,
                sender: messageReceived.sender,
                message: messageReceived.message,
                time: messageReceived.time,
                repliedTo: ''
            }
            await displayChatRoomReceivedNormalMessage(roomName, dataToPush);
        } else {

            var dataToPush = {
                me: me,
                reply: messageReceived.reply,
                normal: messageReceived.normal,
                uuid: messageReceived.uuid,
                sender: messageReceived.sender,
                message: messageRec.message,
                time: messageReceived.time,
                repliedTo: messageReceived.repliedTo
            }
            await displayChatRoomReceivedReplyMessage(roomName, dataToPush);
        }
        resolve(true);
    })

}



//Chat Service to Display ChatRoom Message Received in ChatRoom UI
function displayChatRoomReceivedNormalMessage(roomNameR, data) {
    var roomName = roomNameR.charAt(0).toUpperCase() + roomNameR.slice(1);
    roomName = roomName.toUpperCase();
    var MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + roomName);
    if (MAIN_CHAT_WINDOW !== null) {
        l1 = document.createElement('li');
        l1.setAttribute('id', 'entireChat' + data.uuid);
        div1 = document.createElement('div');
        div2 = document.createElement('div');
        i1 = document.createElement('i');
        p1 = document.createElement('p');
        i2 = document.createElement('i');
        if (data.me == true)
            l1.className = "clearfix odd";
        else
            l1.className = "clearfix";

        div1.className = "conversation-text";
        div2.className = "ctext-wrap";
        // div2.setAttribute('id','1233');
        div2.setAttribute('id', data.uuid);
        div2.setAttribute('onclick', "chatSelected('" + data.uuid + "','true')");
        i1.innerText = data.sender
        i1.style = 'display:none'
        p1.innerText = data.message;
        i2.className = "dateTime";
        i2.innerText = data.time;

        MAIN_CHAT_WINDOW.appendChild(l1);
        l1.appendChild(div1);
        div1.appendChild(div2);
        div2.appendChild(i1);
        div2.appendChild(p1);
        div2.appendChild(i2);

        //Scroll Down
        MAIN_CHAT_WINDOW.scrollTop = MAIN_CHAT_WINDOW.scrollHeight;
    }
}

//Chat Service to Display ChatRoom Reply Message Received in ChatRoom UI
function displayChatRoomReceivedReplyMessage(roomNameR, data) {
    return new Promise((resolve, reject) => {
        var roomName = roomNameR.charAt(0).toUpperCase() + roomNameR.slice(1);
        var MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + roomName);
        if (MAIN_CHAT_WINDOW !== null) {
            l1 = document.createElement('li');
            l1.setAttribute('id', 'entireChat' + data.uuid);
            div1 = document.createElement('div');
            div2 = document.createElement('div');
            div3 = document.createElement('div');
            div4 = document.createElement('div');
            i1 = document.createElement('i');
            p1 = document.createElement('p');
            i2 = document.createElement('i');
            if (data.me)
                l1.className = "clearfix odd";
            else
                l1.className = "clearfix"

            div1.className = "conversation-text";
            div2.className = "ctext-wrap";
            div2.setAttribute('onclick', "chatSelected('" + data.uuid + "','false')");
            div3.className = "replyRecSection";
            span1 = document.createElement('span');
            span1.className = "replySender"
            span1.innerText = data.repliedTo.sender;
            span2 = document.createElement('span');
            span2.className = "replyMessage"
            span2.innerText = data.repliedTo.message;
            span3 = document.createElement('span');
            span3.className = "replyTime"
            span3.innerText = data.repliedTo.time;
            div4.setAttribute('id', data.uuid);

            i1.innerText = data.sender.toUpperCase();
            p1.innerText = data.message;
            i2.className = "dateTime";
            i2.innerText = data.time;

            MAIN_CHAT_WINDOW.appendChild(l1);
            l1.appendChild(div1);
            div1.appendChild(div2);
            div2.appendChild(div3);
            div3.appendChild(span1);
            div3.appendChild(span2);
            div3.appendChild(span3);
            div2.appendChild(div4);
            div4.appendChild(i1);
            div4.appendChild(p1);
            div4.appendChild(i2);

            MAIN_CHAT_WINDOW.scrollTop = MAIN_CHAT_WINDOW.scrollHeight;

        }
        resolve(true);
    })
}

//Chat Service to Store ChatRoom Message in LocalStorage
function storeChatRoomMessageinLocalStorage(room, messageObject) {
    return new Promise((resolve, reject) => {

        var chatRoomLocalhost = window.localStorage.getItem('chatRoomData');
        var json_chat_room = JSON.parse(chatRoomLocalhost);

        if (json_chat_room != null)
            for (var i = 0; i < json_chat_room.length; i++) {
                if (json_chat_room[i].room == room) {
                    json_chat_room[i].data.push(messageObject);
                    json_chat_room = JSON.stringify(json_chat_room);
                    window.localStorage.setItem('chatRoomData', json_chat_room);
                }
            }
        resolve(true);
    })

}

//Chat Service to Display Chat Reply Message Received in Chat UI
function displayNormalReceivedChatMessagesToUI(from, message) {
    var MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + from);
    var ICHAT_WINDOW = document.getElementById('iChatContentForScroll_' + from);
    var getMessageUUID = extras.getUUID();
    var currentTime = extras.getCurrrentTime();
    if (MAIN_CHAT_WINDOW !== null || ICHAT_WINDOW !== null) {
        sendACKForChatToServer(from, 2);
        if (ICHAT_WINDOW !== null) {
            var div1 = document.createElement('div');
            div1.className = "client-chat";
            var h3 = document.createElement('h3');
            h3.innerText = from.toUpperCase()
            var div2 = document.createElement('div');
            div2.className = "row"
            div2.innerText = message;
            var label = document.createElement('label');
            label.className = "chat_time"
            label.innerText = currentTime;
            ICHAT_WINDOW.appendChild(div1);
            div1.appendChild(h3);
            div1.appendChild(div2);
            div2.appendChild(label);

            //Scrolling On Received
            ICHAT_WINDOW.scrollTop = ICHAT_WINDOW.scrollHeight;
        }
        if (MAIN_CHAT_WINDOW !== null) {
            l1 = document.createElement('li');
            l1.setAttribute('id', 'entireChat' + getMessageUUID);
            div1 = document.createElement('div');
            div2 = document.createElement('div');
            i1 = document.createElement('i');
            p1 = document.createElement('p');
            i2 = document.createElement('i');
            l1.className = "clearfix";
            div1.className = "conversation-text";
            div2.className = "ctext-wrap";
            div2.setAttribute('id', getMessageUUID);
            div2.setAttribute('onclick', "chatSelected('" + getMessageUUID + "','false')");
            i1.innerText = from.toUpperCase();
            p1.innerText = message;
            i2.className = "dateTime";
            i2.innerText = currentTime;

            MAIN_CHAT_WINDOW.appendChild(l1);
            l1.appendChild(div1);
            div1.appendChild(div2);
            div2.appendChild(i1);
            div2.appendChild(p1);
            div2.appendChild(i2);

            //Scrolling 
            MAIN_CHAT_WINDOW.scrollTop = MAIN_CHAT_WINDOW.scrollHeight;
        }
    } else {
        //ALERTING USER THROUGH NOTIFICATION
        sendACKForChatToServer(from, 1);
        var messageLobi = from + ' : ' + message;
        extras.osNotification('Chat Message', messageLobi);
        extras.lobiNotification('success', from.toUpperCase(), messageLobi, 'top right', 'bounceIn', 'bounceOut')
        //UPDATING NOTIFICATION COLOUR
        document.getElementById('notificationBadge').style = 'display:block';
        //UPDATING HEADER
        // notificationService.updateNotificationHeaderInstant('Chat', from, username, currentTime, message);
        // var dataToStore = {
        //     messageType: 'Chat',
        //     sender: from,
        //     message: message,
        //     time: currentTime,
        //     sendTo: username
        // }
        // notificationService.storeDataForNotificationHeader(dataToStore);
    }


    var dataToPush = {
        $push: {
            messages: {
                me: false,
                reply: false,
                read: false,
                delivered: false,
                normal: true,
                uuid: getMessageUUID,
                sender: from.toUpperCase(),
                message: message,
                time: currentTime,
                repliedTo: null
            }
        }
    }
    var chatQuery = {
        userName: username,
        chatUser: from
    };
    chatSchema.update(chatQuery, dataToPush).then(resp => {}).catch(resp => {})


    // checkIfUserExistInLocalDatabaseForChat(); 


}

//Chat Service to Display Chat Message Received in Chat UI
function displayReplyReceivedChatMessagesToUI(from, dataRecOverXMPP) {
    return new Promise((resolve, reject) => {
        var getMessageUUID = extras.getUUID();
        var currentTime = extras.getCurrrentTime();
        var MAIN_CHAT_WINDOW = document.getElementById('ChatSectionForScroll' + from);
        var ICHAT_WINDOW = document.getElementById('iChatContentForScroll_' + from);
        if (MAIN_CHAT_WINDOW !== null || ICHAT_WINDOW !== null) {
            sendACKForChatToServer(from, 2);
            if (ICHAT_WINDOW !== null) {
                var div1 = document.createElement('div');
                div1.className = "client-chat iChatRecReplySection";
                var h3 = document.createElement('h3');
                h3.innerText = dataRecOverXMPP.repliedTo.sender
                var div2 = document.createElement('div');
                div2.className = "row"
                div2.innerText = dataRecOverXMPP.repliedTo.message;
                var label = document.createElement('label');
                label.className = "chat_time"
                label.innerText = dataRecOverXMPP.repliedTo.time;
                var span1 = document.createElement('span');
                span1.className = "messageData"
                var i1 = document.createElement('i');
                i1.className = "messageSender"
                i1.innerText = dataRecOverXMPP.sender
                var i2 = document.createElement('i')
                i2.className = "message"
                i2.innerText = dataRecOverXMPP.message
                var i3 = document.createElement('i')
                i3.className = "messageTime"
                i3.innerText = dataRecOverXMPP.time

                ICHAT_WINDOW.appendChild(div1);
                div1.appendChild(h3);
                div1.appendChild(div2);
                div2.appendChild(label);
                div2.appendChild(span1);
                span1.appendChild(i1);
                span1.appendChild(i2);
                span1.appendChild(i3);
                //Scrolling On Received
                ICHAT_WINDOW.scrollTop = ICHAT_WINDOW.scrollHeight;
            }
            if (MAIN_CHAT_WINDOW !== null) {

                l1 = document.createElement('li');
                l1.setAttribute('id', 'entireChat' + getMessageUUID);
                div1 = document.createElement('div');
                div2 = document.createElement('div');
                div3 = document.createElement('div');
                div4 = document.createElement('div');
                i1 = document.createElement('i');
                p1 = document.createElement('p');
                i2 = document.createElement('i');
                l1.className = "clearfix";
                div1.className = "conversation-text";
                div2.className = "ctext-wrap";
                div2.setAttribute('onclick', "chatSelected('" + getMessageUUID + "','false')");
                div3.className = "replyRecSection";
                span1 = document.createElement('span');
                span1.className = "replySender"
                span1.innerText = dataRecOverXMPP.repliedTo.sender;
                span2 = document.createElement('span');
                span2.className = "replyMessage"
                span2.innerText = dataRecOverXMPP.repliedTo.message;
                span3 = document.createElement('span');
                span3.className = "replyTime"
                span3.innerText = dataRecOverXMPP.repliedTo.time;
                div4.setAttribute('id', getMessageUUID);

                i1.innerText = from.toUpperCase();
                p1.innerText = dataRecOverXMPP.message;
                i2.className = "dateTime";
                i2.innerText = dataRecOverXMPP.time;

                MAIN_CHAT_WINDOW.appendChild(l1);
                l1.appendChild(div1);
                div1.appendChild(div2);
                div2.appendChild(div3);
                div3.appendChild(span1);
                div3.appendChild(span2);
                div3.appendChild(span3);
                div2.appendChild(div4);
                div4.appendChild(i1);
                div4.appendChild(p1);
                div4.appendChild(i2);

                //Scrolling 
                MAIN_CHAT_WINDOW.scrollTop = MAIN_CHAT_WINDOW.scrollHeight;
            }
        } else {
            sendACKForChatToServer(from, 1);
            var notificationBadge = document.getElementById('notificationBadge');
            if (notificationBadge !== null)
                notificationBadge.style.display = "none";
            //ALERTING USER THROUGH NOTIFICATION
            var messageLobi = from + ' : ' + dataRecOverXMPP.message;
            extras.osNotification('Chat Message', messageLobi);
            extras.lobiNotification('success', from.toUpperCase(), messageLobi, 'top right', 'bounceIn', 'bounceOut')

            //     var dataToStore = {
            //     messageType: 'Chat',
            //     sender: from,
            //     message: dataRecOverXMPP.message,
            //     time: dataRecOverXMPP.messageTime,
            //     sendTo: username
            // }
            // notificationService.storeDataForNotificationHeader(dataToStore);
        }


        var dataToPush = {
            $push: {
                messages: {
                    me: false,
                    reply: true,
                    normal: false,
                    read: false,
                    delivered: false,
                    sender: from.toUpperCase(),
                    message: dataRecOverXMPP.message,
                    time: dataRecOverXMPP.time,
                    uuid: extras.getUUID(),
                    repliedTo: {
                        sender: dataRecOverXMPP.repliedTo.sender.toUpperCase(),
                        message: dataRecOverXMPP.repliedTo.message,
                        time: dataRecOverXMPP.repliedTo.time
                    }
                }
            }
        }
        var chatQuery = {
            userName: username,
            chatUser: from
        };
        chatSchema.update(chatQuery, dataToPush).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })

    })



    //Store Message


}


//Chat Service to Update User's Delivered Status in Database
function updateUIForCheckedStatus(dom, status) {
    return new Promise((resolve, reject) => {

        var checkDOM = document.getElementsByClassName('single_check');
        switch (status) {
            case 1: {
                for (var i = 0; i < checkDOM.length; i++) {
                    checkDOM[i].innerHTML = "&#10003&#10003"
                }
                break;
            }
            case 2: {
                for (var i = 0; i < checkDOM.length; i++) {
                    checkDOM[i].innerHTML = "&#10003&#10003";
                    checkDOM[i].style.color = "cyan";
                }
                break;
            }
            default: {
                //Default
            }
        }
        resolve(true);
    })

}

//Chat Service to Update User's Seen Status in Database
function updateDatabaseForCheckedStatus(to, status) {
    return new Promise((resolve, reject) => {
        var chatQuery = {
            userName: username,
            chatUser: to.toLowerCase()
        }
        if (status == 1) {
            chatSchema.findOne(chatQuery).then(selectedChat => {
                var messages = selectedChat.messages;
                for (var i = 0; i < messages.length; i++) {

                    var query = {
                        userName: username,
                        chatUser: to.toLowerCase()
                    }

                    var update = {
                        "$set": {}
                    };
                    update["$set"]["messages." + i + ".delivered"] = true;
                    chatSchema.update(query, update).then(res => {}).catch(err => {})
                }
                resolve(true);
            })
        }


        if (status == 2) {
            chatSchema.findOne(chatQuery).then(selectedChat => {
                var messages = selectedChat.messages;

                for (var i = 0; i < messages.length; i++) {

                    var query = {
                        userName: username,
                        chatUser: to.toLowerCase()
                    }

                    var update = {
                        "$set": {}
                    };

                    update["$set"]["messages." + i + ".read"] = true;

                    chatSchema.update(query, update).then(res => {}).catch(err => {})
                }
                resolve(true);

            })

        }

    });
}