
const qs = require('querystring'),
      crypto = require('crypto');

const request = require('request-promise-native');

const core = require('../');

function auth (query) {
  var access_data, info;

  //console.log('QUERY', query);

  return request.post('https://connect.mail.ru/oauth/token', {
    form: {
      client_id: core.config.auth.mailru.client_id,
      client_secret: core.config.auth.mailru.secret,
      code: query.code,
      redirect_uri: query.redirect_uri,
      grant_type: 'authorization_code'
    }
  })
  .then((out) => {
    access_data = JSON.parse(out);
    //console.log('VK ACCESS DATA', access_data);

    var params = {
      method: 'users.getInfo',
      app_id: core.config.auth.mailru.client_id,
      session_key: access_data.access_token,
      secure: 1
    }

    var hash = crypto.createHash('md5'),
        param_string = Object.keys(params)
          .sort()
          .map((item) => item + '=' + params[item])
          .join('');

    hash.update(param_string + core.config.auth.mailru.secret);
    params.sig = hash.digest('hex');

    console.log('PARAMS', params);

    return request.get({
      uri: 'http://www.appsmail.ru/platform/api',
      qs: params
    })
  })
  .then((out) => {
    info = JSON.parse(out);
    //console.log('INFO', info);

    var user = new core.User();

    /*if (!account) return Promise.reject('NO_EMAIL_ASSIGNED');
    return user.auth({
      type: 'GOOGLE+',
      user_id: info.id,
      email: account.value
    })*/
  })
  .then((uuid) => {
    return {
      access_token: access_data.access_token,
      uuid: uuid,
      access_data: access_data,
      info: info
    }
  })

}
module.exports = auth;
