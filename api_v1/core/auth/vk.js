
const qs = require('querystring');

const request = require('request-promise-native');

const core = require('../');

function auth (query, user) {
  console.log('QUERY', query, core.config.auth.vk);
  var access_data;
  return request.get({
    uri: 'https://oauth.vk.com/access_token',
    qs: {
      client_id: core.config.auth.vk.client_id,
      client_secret: core.config.auth.vk.secret,
      code: query.code,
      redirect_uri: query.redirect_uri
    }
  })
  .then((out) => {
    access_data = JSON.parse(out);
    console.log('VK ACCESS DATA', access_data);

    return request.get({
      uri: 'https://api.vk.com/method/users.get',
      qs: {
        access_token: access_data.access_token,
        v: core.config.auth.vk.api_version,
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
    var info = JSON.parse(out).response[0];
    //console.log('INFO', info);

    if (!user) {
      user = new core.User();
    }

    return user.auth({
      type: 'VK',
      user_id: access_data.user_id,
      email: access_data.email
    })
      .then(() => {
        return {
          access_token: access_data.access_token,
          uuid: user.uuid,
          info: info,
          access_data: access_data,
          
          avatar: info.photo_50,
          first_name: info.first_name,
          last_name: info.last_name,
        }
      })
  })

}
module.exports = auth;
