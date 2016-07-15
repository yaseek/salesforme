
const fs = require('fs');

const yaml = require('js-yaml');

function loadConfig (filename) {
  var config = module.exports;
  return new Promise((resolve, reject) => {
    try {
      var doc = yaml.safeLoad(fs.readFileSync(filename, 'utf8'));

      Object.keys(doc).forEach((key) => {
        config[key] = doc[key];
      });
      
      resolve(doc);
    } catch (e) {
      reject(e);
    }
  });
}
module.exports.loadConfig = loadConfig;
