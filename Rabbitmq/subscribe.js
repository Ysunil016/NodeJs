const amqp = require('amqplib/callback_api');

amqp.connect("amqp://localhost", (err, connection) => {
    connection.createChannel((err, channel) => {
        let counter = 0;
        channel.consume("SUNIL", (msg) => {
            msg = msg.content.toString();
            console.log("Receiving Message as "+counter);
            counter++;
            console.log(msg);
            
        }, {
            noAck: true
        });
    });
});