let counter = 0;

process.on('message', (message) => {
    console.log("Delay " + message.delay)
    setInterval(() => {
        process.send(message);
    }, 1009);
})