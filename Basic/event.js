const event = require('events');
const eventEmmiter = new event.EventEmitter();

eventEmmiter.on("Sunil", () => {
    console.log("Sunil's Event is Triggered");
});

eventEmmiter.emit('Sunil');