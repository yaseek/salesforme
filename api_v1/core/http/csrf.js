'use strict';

const crypto = require('crypto');

const core = require('../');

const uuid = require('node-uuid');

const SECURE_PHRASE = 'ea966ffc-efc2-43eb-9f22-6b38a2072255',
      CSRF_TIMEOUT = 30*60*1000; //milliseconds

function createDigest (buffer) {
  let hmac = crypto.createHmac('sha1', SECURE_PHRASE);
  hmac.update(buffer);
  return hmac.digest('hex');
}

function makeCSRF (id, timestamp) {
  let time = (timestamp && !isNaN(timestamp)) ? timestamp : Date.now(),
      buf = Buffer.alloc(8+16),
      lo = time >> 0,
      hi = (time - lo) / 0x100000000;

  //console.log(time.toString(16), hi.toString(16), lo.toString(16));
  buf.writeInt32LE(lo, 0);
  buf.writeInt32LE(hi, 4);
  uuid.parse(id, buf, 8);

  return buf.toString('hex') + createDigest(buf);
}
module.exports.makeCSRF = makeCSRF;


function checkCSRF (csrf) {
  if (!csrf || csrf.length < 48) throw Error('undefined CSRF');

  let timebuf = Buffer.from(csrf.substr(0, 48), 'hex'),
      uuidbuf = Buffer.from(csrf.substr(16, 32), 'hex'),
      hi = timebuf.readInt32LE(4),
      lo = timebuf.readInt32LE(0),
      time = hi * 0x100000000 + lo,
      sum = csrf.substr(48),
      timediff = Date.now() - time,
      checked = false;

  if (timediff < 0 || timediff > CSRF_TIMEOUT) checked = false;
  checked = createDigest(timebuf) === sum;
  return {
    checked: checked,
    uuid: uuidbuf.length ? uuid.unparse(uuidbuf) : void(0),
    time: time
  }
}
module.exports.checkCSRF = checkCSRF;

var id = uuid.v4(),
    timestamp = Date.now();

console.log(id, makeCSRF(id, timestamp))
console.log(id, makeCSRF(id, timestamp + 1000))

//var csrf = '91172f0b57010000c57d915652b44aa5b37ee7e05f79f5130ef5dae6833d9cc36a5231b4dd28532673ceaf62';
//var csrf = '7d915652b44aa591172f0b57010000c57d915652b0000c57d915652b44aa57d915652b44aa5';


//console.log('CHECK', checkCSRF(csrf))
