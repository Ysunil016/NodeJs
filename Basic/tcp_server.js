var net = require('net');

var server = net.createServer(function (socket) {
	socket.on('data', (data) => {
		console.log("Client :: " + data);
		socket.write('Message Received');
		socket.pipe(socket);
	})
});

server.on('error', (err) => {
	console.log("err " + err);
})

server.listen(1337, '127.0.0.1');