const http = require('http');
const urlParse = require('url');

http.createServer((req, res) => {
    console.log(urlParse.parse(req.url).pathname);
    res.writeHead(200)
    res.write("Ola");
    res.end();
}).listen(8080);
