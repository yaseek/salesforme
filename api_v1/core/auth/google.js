
const qs = require('querystring');

const request = require('request-promise-native');

const core = require('../');

function auth (query) {
  var access_data;
  var request_data = {
    client_id: core.config.auth.google.client_id,
    client_secret: core.config.auth.google.secret,
    code: query.code,
    redirect_uri: query.redirect_uri,
    grant_type: 'authorization_code'
  }
  console.log('QUERY', query, request_data);
  return request.get('https://www.googleapis.com/oauth2/v4/token', {
    qs: request_data
  })
  .then((out) => {
    access_data = JSON.parse(out);
    console.log('VK ACCESS DATA', access_data);

    /*return request.get({
      uri: 'https://api.vk.com/method/users.get',
      qs: {
        access_token: access_data.access_token,
        v: core.config.info.vk_api_version,
        fields: `photo_id, verified, sex, bdate, city, country, home_town, has_photo, 
          photo_50, photo_100, photo_200, photo_400_orig, 
          online, contacts, 
          followers_count, 
          occupation, nickname, 
          timezone, 
          screen_name, maiden_name, crop_photo`
      }
    })*/
  })
  /*.then((out) => {
    var info = JSON.parse(out);
    console.log('INFO', info);

    var user = new core.User();

    return user.auth({
      type: 'VK',
      user_id: access_data.user_id,
      email: access_data.email
    })
  })*/
  .then(() => {
    return {
      access_data: access_data
    }
  })

}
module.exports = auth;
