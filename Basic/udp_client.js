const dgram = require('dgram');

let Source = Buffer.alloc(10);
Source.write("CON", 'utf-8');
let Destination = Buffer.alloc(10);
Destination.write("GDM", 'utf-8');
let Length = Buffer.from([0x00,0x59]); // 2 Byte --> 89
let ID = Buffer.from([0x44,0x8F]); // 2 Bytes --> 17551
let MFC_INDEX = Buffer.from([0x63]); // 1 Byte --> 99
let MAP_INDEX = Buffer.alloc(50);
MAP_INDEX.write("", 'utf-8'); 
let DATA_TYPE = Buffer.alloc(10);
DATA_TYPE.write("", 'utf-8');
let UNIQUE_ID = Buffer.from([0x00,0x00,0x44,0x8F]); // 4 Byte --> 17551

let CMS_BUFFER = Buffer.concat([Source, Destination, Length, ID, MFC_INDEX, MAP_INDEX, DATA_TYPE, UNIQUE_ID]);


var client = dgram.createSocket('udp4');
    client.send(CMS_BUFFER, 0, CMS_BUFFER.length, 33105, "13.232.230.34", function (err, bytes) {
        if (err) throw err;
        client.close();
});
