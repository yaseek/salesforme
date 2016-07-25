const fs = require('fs'),
      path = require('path');


module.exports.config = require('./config');
module.exports.auth = {
  vk: require('./auth/vk'),
  fb: require('./auth/fb')
}
module.exports.db = require('./db');
module.exports.User = require('./model/user');


function loadResources (app, dir) {
  fs.readdir(dir, function (err, files) {
    if (err) return;

    files.forEach(function(filename) {
      require(path.join(dir, filename))(app);
    });

  });
}
module.exports.loadResources = loadResources;