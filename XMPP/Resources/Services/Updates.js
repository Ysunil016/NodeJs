let clientDetail = require('../data/loginObject');
module.exports = {
    getDashboardUpdate
}

function getDashboardUpdate() {
    getClientInfo();
    getTaskForceParticipant();
    getAllForum();
}

function getClientInfo() {
    console.log(clientDetail);
    var clientInfoRender = $('#clientInfoTemplate').html()
    var clientInfoComplie = Handlebars.compile(clientInfoRender)
    console.log(clientDetail);
    $('.clientInfoContainer').html(clientInfoComplie(clientDetail))
}

function getTaskForceParticipant() {
    var {
        taskForce,
        force,
        conclave
    } = clientDetail;
    var xhr = new XMLHttpRequest();
    xhr.timeout = 20000;
    xhr.open('GET', "http://localhost:6969/roleservice/client/getAllTaskForceParticipant/" + conclave + "/" + force + "/" + taskForce, true)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
            var jsonResponse = JSON.parse(xhr.responseText)
            var clientInfoRender = $('#taskForceParticipantTemplate').html()
            var clientInfoComplie = Handlebars.compile(clientInfoRender)
            console.log(jsonResponse);
            $('.taskForceParticipantContainer').html(clientInfoComplie(jsonResponse))
        }
    }
    if (xhr.timeout) {
        console.log("Hello")
    }
}

function getAllForum() {
    var template = $('#forumTemplate').html()
    var compiler = Handlebars.compile(template)
    console.log(clientDetail);
    $('.forumContainer').html(compiler(clientDetail))
}