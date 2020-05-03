const amqp = require('amqplib/callback_api');

amqp.connect("amqp://localhost", (err, connection) => {
    connection.createChannel((err, channel) => {
        let counter = 0;
        setInterval(() => {
            let msg = "SUNIL_YADAV " + counter;
            counter++;
            console.log(counter);
            channel.publish("", "SUNIL", Buffer.from(msg));
        });

    });
});