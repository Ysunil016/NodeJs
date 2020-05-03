let xmpp = require('simple-xmpp');

xmpp.connect({
        jid: "RANA_SCO" + '@' + "wesee",
        password: "s6Kvf",
        host: "localhost",
        port: 5222
    });
    xmpp.on('online', async (data) => {
        console.log('I am Online Now ' + data.jid);
        var roomName = "fuddigreenenc";
        var room_resource = roomName + "@" + "conference.wesee" + "/" + "RANA_SCO";
        xmpp.join(room_resource, "admin");
   
        setTimeout(()=>{
            xmpp.send("sanjay_cco@wesee","Hey Sanjay",false);
            xmpp.send("fuddigreenenc@conference.wesee", "Hey Sunil", true);
        },5000);
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
       console.log(jid);
    });

    xmpp.on('error', (error) => {
        messageLobi = '<i><h4>Chat Service Not Reachable</h4></i>';
        console.log(error);
    });


    xmpp.on('groupchat', async (conference, from, message, stamp) => {
        console.log("Hola");
    });

    xmpp.getRoster();

