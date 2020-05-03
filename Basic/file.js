const fs = require('fs');
const readLine = require('readline');

// fs.open("./Sunil.txt", 'w', (err, data) => {
//     console.log(data);
// });

// fs.writeFile("./Sunil.txt", "Sunil Yadav - 12:02:1995", (err) => {
//     if (!err)
//         console.log("Written Successfully");
// })

// fs.appendFile("./Sunil.txt", "\nNirmala Yadav - 16:07:1980", (err) => {
//     if (!err)
//         console.log("Written Successfully");
// })

// fs.readFile("./Sunil.txt", (err, data) => {
//     console.log("Sunil " + data);
// })

const readLineInterface = readLine.createInterface({
    input: fs.createReadStream("./Sunil.txt")
})

let counter = 0;
readLineInterface.on("line", (data) => {
    counter++;
    console.log(counter + " for " + data);
})




// const event = fs.createReadStream("./sunil.txt");

// event.on('open', (file) => {
//     console.log("File is Open");
// })

// event.on('close', () => {
//     console.log("File is Closed");
// })