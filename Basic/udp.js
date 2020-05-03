const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('listening', () => {
        var address = server.address();
        console.log('UDP Listening from - > ' + address.address + ' and PORT: ' + address.port);
});

server.on('message', function (message, remote) {
    console.log(message);
    console.log(remote);
});

server.bind(33105,"127.0.0.1");
