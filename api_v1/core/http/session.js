
const crypto = require('crypto');

var config;

function init (config_data) {
  config = config_data;
  return Promise.resolve(config);
}
module.exports.init = init;

function signature (str) {
  var hmac = crypto.createHmac('sha1', config.secure_phrase);
      
  hmac.update(str);
  return hmac.digest('hex');
}

/*
expected data:
  uuid  -- REQUIRED
  access_data -- OPTIONAL
*/
function getData (data) {
  var timestamp = Date.now(),
        sid = [
        data.uuid,
        timestamp,
      ].join('.');

  return {
    sid: [
      sid,
      signature(sid)
    ].join('.'),
    auth: {
      uuid: data.uuid,
      access_data: data.access_data
    }
  };
}
module.exports.getData = getData;

function authority (req, res, next) {
  var sid = req.headers[config.header];
  if (!checkSessionId(sid)) {
    res.status(403).send(new res.Response('Forbidden'))
  } else {
    next();
  }
}
module.exports.authority = authority;

function checkSessionId (sid) {
  if (!sid) return false;
  var matches = sid.match(/^(.+)\.(\d+)\.(.+)$/);
  console.log('SESSION ID', matches, sid);
  if (!matches) return false;

  var timestamp = Date.now();
  if ((Number(matches[2]) + config.expires * 1000 < timestamp) || 
      (Number(matches[2]) > timestamp) ) return false;

  return signature([
      matches[1],
      matches[2]
    ].join('.')) === matches[3];
}