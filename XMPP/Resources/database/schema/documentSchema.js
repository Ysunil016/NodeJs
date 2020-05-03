const mongoose = require('mongoose');
const mSchema = mongoose.Schema({
    fileDownloadUri:String,
    fileName:String,
    fileType:String,
    size:Number,
})

var documentModel = mongoose.model('document',mSchema);

module.exports = {
    documentModel:documentModel
}