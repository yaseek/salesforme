'use strict';

const fs = require('fs'),
      path = require('path');


module.exports.config = require('./config');
module.exports.session = require('./http/session');
module.exports.csrf = require('./http/csrf');

module.exports.auth = {
  vk: require('./auth/vk'),
  fb: require('./auth/fb'),
  google: require('./auth/google'),
  mailru: require('./auth/mailru'),
  yandex: require('./auth/yandex')
}
module.exports.db = require('./db');
module.exports.User = require('./model/user');
module.exports.Shop = require('./model/shop');
module.exports.Action = require('./model/action');
module.exports.Uploads = require('./model/uploads');
module.exports.Banners = require('./model/banners');
module.exports.Ads = require('./model/ads');

module.exports.response = require('./http/response');
module.exports.sqlResolve = require('./db/sql-resolve');

var Mailer = require('./model/mailer');
module.exports.mailer = new Mailer();

function loadResources (app, dir) {
  fs.readdir(dir, function (err, files) {
    if (err) return;

    files.forEach(function(filename) {
      require(path.join(dir, filename))(app);
    });

  });
}
module.exports.loadResources = loadResources;