
const qs = require('querystring');

const request = require('request-promise-native');

const core = require('../');

function auth (query) {
  return request.get({
    uri: 'https://oauth.vk.com/access_token',
    qs: {
      client_id: core.config.info.vk_app,
      client_secret: core.config.secrets.vk,
      code: query.code,
      redirect_uri: query.redirect_uri
    }
  })
  .then((access_data) => {
    var user = new core.User();
    if (!user.getBySocialId({ vk: access_data.user_id })) {

    }
    return user.auth({
      type: 'VK',
      access_data: access_data
    })
      .then(() => {
        return {
          access_token: access_data.access_token,
          uuid: user.uuid
        }
      })
  })

}
module.exports = auth;
