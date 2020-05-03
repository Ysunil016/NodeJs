const mongo = require('mongodb');
var dbIns = mongo.connect("mongodb://localhost:27017", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then((db) => {
    let dbo = db.db("BasicNodeMongo");
    dbo.createCollection("SunilYadav", (err, res) => {
        console.log(res);
    })
    return db;
}).catch(err => {
    console.log(err)
})