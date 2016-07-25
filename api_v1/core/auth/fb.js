
const qs = require('querystring');

const request = require('request-promise-native');

const core = require('../');

function auth (query) {
  //console.log('QUERY', query);
  var access_data;
  return request.get({
    uri: 'https://graph.facebook.com/v2.3/oauth/access_token',
    qs: {
      client_id: core.config.auth.facebook.client_id,
      client_secret: core.config.auth.facebook.secret,
      code: query.code,
      redirect_uri: query.redirect_uri
    }
  })
  .then((out) => {
    access_data = JSON.parse(out);
    console.log('FB ACCESS DATA', access_data);

    return request.get({
      uri: 'https://graph.facebook.com/v2.7/me',
      qs: {
        access_token: access_data.access_token,
        fields: [
          'name',
          'id',
          'email',
          'picture'
        ].join(',')
      }
    })
  })
  .then((out) => {
    var info = JSON.parse(out);
    console.log('INFO', info);

    var user = new core.User();

    return user.auth({
      type: 'FB',
      user_id: info.id,
      email: info.email,
      access_data: access_data
    })
      .then(() => {
        return {
          access_token: access_data.access_token,
          uuid: user.uuid,
          info: info.response[0],
          access_data: access_data
        }
      })
  })

}
module.exports = auth;
