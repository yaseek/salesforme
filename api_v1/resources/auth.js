
const core = require('../core');

module.exports = function (app) {

  app.get( '/auth', (req, res) => {
    
    var method = core.auth[req.query.id];

    if (method && req.query.code) {
      method(req.query)
        .then((out) => {
          var session_data = core.session.getData(out);
          res.status(200).send(new res.Response(out));
        })
        .catch((err) => {
          res.status(500).send(err);
        })
    } else {
      res.handleError({code: 403, message: 'UNDEFINED_PARAMS'})
    }
  });

  app.post( '/auth', (req, res) => {
    //console.log('BODY', req.body);  
    
    var user = new core.User();
    user.checkAuth(req.body)
      .then((uuid) => {
        var session_data = core.session.getData({uuid:uuid});
        res.status(200).send(new res.Response(session_data));  
      })    
      .catch((err) => {
        console.log('ERR', err);
        res.handleError({code: 401, message: 'AUTH_FAILED'})
      })
  })

  app.post( '/auth/native', (req, res) => {

    if (!req.body.email || !req.body.password) {
      return res.handleError({code: 500, message: 'NOT_ENOUGH_ARGS'});
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
      .then((uuid) => {
        res.status(200).send(new res.Response({uuid:uuid}));
      })
      .catch((err) => {
        res.handleError(err);
      })
    })
    .catch((err) => {
      res.handleError({code: 400, message: 'ALREADY_EXISTS'})
    })
  })

}