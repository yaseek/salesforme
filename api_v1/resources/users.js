
const core = require('../core');

module.exports = function (app) {

  app.get( '/users/me', [ core.session.authority ], (req, res) => {
    res.send(new res.Response('ok'));
  });

}