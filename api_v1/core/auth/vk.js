
const request = require('request');

function auth (code) {
  return Promise.resolve({access_token:'1234567890'})
}
module.exports = auth;
