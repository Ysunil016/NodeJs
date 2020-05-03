let xmpp = require('simple-xmpp');
xmpp.connect({
    jid: "RANA_FLO" + '@' + "wesee",
    password: "uIcgb",
    host: "localhost",
    port: 5222
});
xmpp.on('online', async (data) => {
    console.log('I am Online Now ' + data.jid);
    var roomName = "fuddigreenenc";
    var room_resource = roomName + "@" + "conference.wesee" + "/" + "RANA_FLO";
    xmpp.join(room_resource, "admin");
    setTimeout(() => {
        xmpp.send("sunil_sco@wesee", "Hey Sunil", false);
        xmpp.send(room_resource, "Hey Sunil", true);
    }, 8000);
});
xmpp.on('chat', async (fromR, messageR) => {
    console.log(messageR);
});

xmpp.on('chatstate', function (from, state) {
    console.log('% is currently %s', from, state);
});

xmpp.on('close', () => {
    console.log("Closed");
});

xmpp.on('buddy', async (jid, state, statusText, resource) => {
    console.log(jid + " is " + state);
});

xmpp.on('error', (error) => {
    messageLobi = '<i><h4>Chat Service Not Reachable</h4></i>';
    console.log(error);
});


xmpp.on('groupchat', async (conference, from, message, stamp) => {
    console.log(conference);
    console.log(from);
    console.log(message);
    console.log(stamp);
});

xmpp.getRoster();