
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

  app.post( '/auth', (req, res) => {
    console.log('BODY', req.body);  
    
    var user = new core.User();
    user.checkAuth(req.body)
      .then((out) => {
        res.status(200).send(new res.Response(out));  
      })    
      .catch((err) => {
        res.status(401).send('Authorisation failed');
      })
  })

  app.post( '/auth/native', (req, res) => {

    if (!req.body.email || !req.body.password) {
      return res.status(500).send('bad args');
    }

    var user = new core.User();
    user.checkNotExistsUser({user_id: req.body.email, type: 'native'})
    .then(() => {
      user.auth({
        type: 'native',
        user_id: req.body.email,
        email: req.body.email,
        password: req.body.password
      })
      .then((out) => {
        core.mailer.sendMail({
          from: core.config.admin.fromAddress,
          to: req.body.email,
          subject: 'Congratulations',
          text: `Доброго времени суток!

          Поздравляем вас с регистрацией на SalesFor.me`
        })
        return out;
      })
      .then((out) => {
        res.status(200).send(new res.Response(out));
      })
      .catch((err) => {
        res.status(500).send(err);
      })
    })
    .catch((err) => {
      res.status(400).send('User already exists');
    })
  })

}