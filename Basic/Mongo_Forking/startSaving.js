var process = require('child_process');

let save_in_database = process.fork("./mongo_fork.js");


let count = 0;
setInterval(() => {

    save_in_database.send({
        username: "Sunil",
        count: count
    });
    count++;
},10000);

save_in_database.on('message', (msg) => {
    console.log("Message Save to Database"+ msg);
})