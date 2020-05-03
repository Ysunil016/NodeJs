var dataReceivedAtLoginString = window.localStorage.getItem('clientData');
var dataReceivedAtLoginJSON = JSON.parse(dataReceivedAtLoginString);

module.exports = dataReceivedAtLoginJSON;