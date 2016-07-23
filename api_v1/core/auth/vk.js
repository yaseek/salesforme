
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
        fields: 'photo_id, verified, sex, bdate, city, country, home_town, has_photo, photo_50, photo_100, photo_200_orig, photo_200, photo_400_orig, photo_max, photo_max_orig, online, lists, domain, has_mobile, contacts, site, education, universities, schools, status, last_seen, followers_count, common_count, occupation, nickname, relatives, relation, personal, connections, exports, wall_comments, activities, interests, music, movies, tv, books, games, about, quotes, can_post, can_see_all_posts, can_see_audio, can_write_private_message, can_send_friend_request, is_favorite, is_hidden_from_feed, timezone, screen_name, maiden_name, crop_photo, is_friend, friend_status, career, military, blacklisted, blacklisted_by_me'
      }
    })
  })
  .then((out) => {
    var info = JSON.parse(out);

    var user = new core.User();

    return user.auth({
      type: 'VK',
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
