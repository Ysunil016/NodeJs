const mongoose = require('mongoose');
const chatSchema = mongoose.Schema;

var chatMessage = new chatSchema({
    userName: String,
    chatUser: String,
    messages: [{
        me: Boolean,
        delivered:Boolean,
        read:Boolean, 
        reply: Boolean,
        uuid: String,
        normal: Boolean,
        sender: String,
        message: String,
        time: String,
        repliedTo: {
            sender: String,
            message: String,
            time: String
        }
    }]
});

var chatRoomMessage = new chatSchema({
    userName: String,
    chatRoom: String,
    members: [String],
    messages: [{
        me: Boolean,
        delivered:Boolean,
        read:Boolean,        
        reply: Boolean,
        uuid: String,
        normal: Boolean,
        sender: String,
        message: String,
        time: String,
        repliedTo: {
            sender: String,
            message: String,
            time: String
        }
    }]
})

var iChatMessage = new chatSchema({
    userName: String,
    chatUser: String,
    messages: [{
        me: Boolean,
        delivered:Boolean,
        read:Boolean, 
        reply: Boolean,
        uuid: String,
        normal: Boolean,
        sender: String,
        message: String,
        time: String,
        repliedTo: {
            sender: String,
            message: String,
            time: String
        }
    }]
})

var chatMessageModel = mongoose.model('chatMessage', chatMessage);
var chatRoomMessageModel = mongoose.model('chatRoomMessage', chatRoomMessage);
var iChatMessageModel = mongoose.model('iChatMessage', iChatMessage);

module.exports = {
    chatMessageModel: chatMessageModel,
    chatRoomMessageModel: chatRoomMessageModel
}