
const core = require('../core');

module.exports = function (app) {

  //http://localhost:4000/auth?id=vk&code=ed255373d658685e66
  app.get( '/auth', (req, res) => {
    
    var method = core.auth[req.query.id];

    if (method && req.query.code) {
      method(req.query)
        .then((out) => res.status(200).send(out))
        .catch((err) => {
          res.status(500).send(err);
          throw Error(err);
        })
    } else {
      res.status(403).send('undefined parameters');
    }
  });

}