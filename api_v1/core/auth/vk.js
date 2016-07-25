
const qs = require('querystring');

const request = require('request-promise-native');

const core = require('../');

function auth (query) {
  //console.log('QUERY', query);
  var access_data;
  return request.get({
    uri: 'https://oauth.vk.com/access_token',
    qs: {
      client_id: core.config.info.vk_app,
      client_secret: core.config.secrets.vk,
      code: query.code,
      redirect_uri: query.redirect_uri
    }
  })
  .then((out) => {
    access_data = JSON.parse(out);

    return request.get({
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
    })
  })
  .then((out) => {
    var info = JSON.parse(out);

    var user = new core.User();

    return user.auth({
      type: 'VK',
      email: access_data.email,
      access_data: access_data
    })
      .then(() => {
        return {
          access_token: access_data.access_token,
          uuid: user.uuid,
          info: info.response[0]
        }
      })
  })

}
module.exports = auth;
