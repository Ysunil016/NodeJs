const mongoose = require('mongoose');
const mSchema = mongoose.Schema;

var notificationSchema = new mSchema({
    userName: String,
        counter:{
            bulletinBoardCounter:Number,
            chatCounter:Number,
            emailCounter:Number,
            documentCounter:Number
        },
        notifications:[{
        messageType:String,
        sender:String,
        message:String,
        time:String,
        sendTo:String
    }]
});

var notificationModel = mongoose.model('notificationData', notificationSchema);

module.exports = {
    notificationModel: notificationModel
}