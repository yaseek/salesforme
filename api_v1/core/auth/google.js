
const qs = require('querystring');

const request = require('request-promise-native');

const core = require('../');

function auth (query) {
  var access_data, info;

  //console.log('QUERY', query);

  return request.post('https://www.googleapis.com/oauth2/v4/token', {
    form: {
      client_id: core.config.auth.google.client_id,
      client_secret: core.config.auth.google.secret,
      code: query.code,
      redirect_uri: query.redirect_uri,
      grant_type: 'authorization_code'
    }
  })
  .then((out) => {
    access_data = JSON.parse(out);
    //console.log('VK ACCESS DATA', access_data);

    return request.get({
      uri: 'https://www.googleapis.com/plus/v1/people/me',
      qs: {
        access_token: access_data.access_token
      }
    })
  })
  .then((out) => {
    info = JSON.parse(out);
    //console.log('INFO', info);

    var user = new core.User();

    var account = (info.emails || []).reduce((p, c) => {
      return p || ( c.type === 'account' ? c : null);
    }, null);

    if (!account) return Promise.reject('NO_EMAIL_ASSIGNED');
    return user.auth({
      type: 'GOOGLE+',
      user_id: info.id,
      email: account.value
    })
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
