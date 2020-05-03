let Source = Buffer.alloc(10);
Source.write("CON", 'utf-8');
let Destination = Buffer.alloc(10);
Destination.write("GDM", 'utf-8');
let Length = Buffer.from([0x59,0x00]); // 2 Byte --> 89    // Keep In Mind About Kamla Mam's Buffer
let ID = Buffer.from([0x44,0x8F]); // 2 Bytes --> 17551
let MFC_INDEX = Buffer.from([0x63]); // 1 Byte --> 99
let MAP_INDEX = Buffer.alloc(50);
MAP_INDEX.write("", 'utf-8'); 
let DATA_TYPE = Buffer.alloc(10);
DATA_TYPE.write("", 'utf-8');
let UNIQUE_ID = Buffer.from([0x44,0x8F,0x00,0x00]); // 4 Byte --> 17551

let CMS_BUFFER = Buffer.concat([Source, Destination, Length, ID, MFC_INDEX, MAP_INDEX, DATA_TYPE, UNIQUE_ID]);
console.log('====================================');
console.log(CMS_BUFFER.toString('utf-8',0,10));
console.log(CMS_BUFFER.toString('utf-8',10,20));
console.log(CMS_BUFFER.toString('hex',20,22));
console.log(CMS_BUFFER.toString('hex',22,24));
console.log(CMS_BUFFER.toString('hex',24,25));
console.log(CMS_BUFFER.toString('utf-8',50,75));
console.log(CMS_BUFFER.toString('utf-8',75,85));
console.log(CMS_BUFFER.toString('hex',85,89));






/*
// Sunil

<Buffer 43 4f 4e 00 00 00 00 00 00 00 47 44 4d 00 00 00 00 00 00 00 00 59 44 8f 63 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... >
89
{ address: '45.117.180.254',
  family: 'IPv4',
  port: 58925,
  size: 89 }



// Kamla Mam First without Loop

<Buffer 43 4f 4e 00 00 00 00 00 00 00 47 44 4d 00 00 00 00 00 00 00 59 00 8f 44 63 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 ... >
{ address: '103.90.183.77',
  family: 'IPv4',
  port: 65007,
  size: 89 }

*/