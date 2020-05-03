const fs = require('fs');
const fork = require('child_process').fork;

let forkProcessHandler = fork(__dirname + '/ProcessHandler.js');
forkProcessHandler.on('message', (msg) => {
    console.log(msg.processName + " is Executed");
})

fs.readFile(__dirname + "/Processes.json", (err, data) => {
    let processesJSON = JSON.parse(data.toString());
    for (let i = 0; i < processesJSON.length; i++) {
        forkProcessHandler.send(processesJSON[i]);
    }
})