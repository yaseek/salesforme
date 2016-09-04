
const qs = require('querystring');

const request = require('request-promise-native');

const core = require('../');

function auth (query, user) {
  console.log('QUERY', query, core.config.auth.yandex);
  var access_data;
  return request.post({
    uri: 'https://oauth.yandex.ru/token',
    form: {
      client_id: core.config.auth.yandex.client_id,
      client_secret: core.config.auth.yandex.secret,
      code: query.code,
      grant_type: 'authorization_code'
    }
  })
  .then((out) => {
    access_data = JSON.parse(out);
    console.log('YANDEX ACCESS DATA', access_data);

    return request.get({
      uri: 'https://login.yandex.ru/info',
      qs: {
        format: 'json',
        oauth_token: access_data.access_token
      }
    })
  })
  .then((out) => {
    var info = JSON.parse(out);
    console.log('INFO', info);

    if (!user) {
      user = new core.User();
    }

    return user.auth({
      type: 'YANDEX',
      user_id: info.id,
      email: info.default_email || info.emails[0]
    })
      .then(() => {
        return {
          access_token: access_data.access_token,
          uuid: user.uuid,
          info: info,
          access_data: access_data,
          
          avatar: [
            'https://avatars.mds.yandex.net/get-yapic',
            info.default_avatar_id,
            'islands-retina-50'
          ].join('/'),
          first_name: info.first_name,
          last_name: info.last_name,
        }
      })
  })

}
module.exports = auth;
