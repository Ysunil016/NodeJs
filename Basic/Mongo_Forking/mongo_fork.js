let mongoose = require('mongoose');

let db2 = mongoose.createConnection();
console.log("Connecting to Mongo")

mongoose.connect("mongodb://localhost:27017/mongo_fork", {
    useNewUrlParser: true
}).then().catch(err => {
    console.log("Not Connected to Database " + err);
})

const event = require('events');
const eventEmmiter = new event.EventEmitter();


process.on('message', (msg) => {
    eventEmmiter.emit('Sunil', msg);
})

async function saveData2Database(msg) {
    return new Promise((resolve, reject) => {
        db2.collection("test").insert(msg, (err) => {
            if (err)
                console.log("Message Not Saved");
            else
                console.log("Saved")
            resolve(true);
        });
    })

}

eventEmmiter.on("Sunil", (msg) => {
    db2.collection("test").insert({
        username: "Sunil"
    }, (err) => {
        if (err)
            console.log("Message Not Saved");
        else
            console.log("Saved")
        resolve(true);
    });
});