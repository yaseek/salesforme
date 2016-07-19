const fs = require('fs'),
      path = require('path');

module.exports.config = require('./config');
module.exports.auth = {
  vk: require('./auth/vk')
}

function loadResources (app, dir) {
  fs.readdir(dir, function (err, files) {
    if (err) return;

    files.forEach(function(filename) {
      require(path.join(dir, filename))(app);
    });

  });
}
module.exports.loadResources = loadResources;