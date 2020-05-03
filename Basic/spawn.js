const {
    spawn
} = require('child_process');

// const pro = spawn(__dirname + "/sh.sh", [""]);
const pro = spawn("ps", ["-A"]);
let counter = 0;
pro.stdout.on('data', data => {
    counter++;
    console.log(counter)
    console.log(data.toString());
})
// setInterval(() => {
//     console.log("SUNIL HERE");
// }, 5000);