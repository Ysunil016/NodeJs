const mongoose = require('mongoose');
var forumMessage = new mongoose.Schema({
    username:String,
    bulletinBoardName: String,
    forceName: String,
    groupName:String,
    forceName:String,
    conclaveName:String,
    comments: [{
        time: String,
        sender: String,
        comment: String
    }]
});

var forumMessageSchema = mongoose.model('bulletinMessage', forumMessage);

module.exports = {
    forumMessageSchema
}