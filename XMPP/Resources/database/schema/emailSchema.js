const mongoose = require('mongoose');
var eInbox = mongoose.Schema({
    username:String,
    uuid: String,
    sender:String,
    subject: String,
    content: String,
    time: String
});
var eSent = mongoose.Schema({
    username:String,
    uuid: String,
    sendTo: String,
    subject: String,
    content: String,
    time: String
});
var eDraft = mongoose.Schema({
    username:String,
    uuid: String,
    subject: String,
    content: String,
    time:String
});
var eTrash = mongoose.Schema({
    username:String,
    uuid: String,
    subject: String,
    content: String,
    time:String
});

var eInboxModel = mongoose.model('inboxData', eInbox);
var eSentModel = mongoose.model('sentData', eSent);
var eDraftModel = mongoose.model('draftData', eDraft);
var eTrashModel = mongoose.model('trashData', eTrash);

module.exports = {
    eInboxModel: eInboxModel,
    eSentModel: eSentModel,
    eDraftModel: eDraftModel,
    eTrashModel: eTrashModel
}