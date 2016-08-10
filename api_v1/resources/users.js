
const core = require('../core')

module.exports = function (app) {

  app.get('/users/me', [ core.session.authority ], (req, res) => {
    res.user.get()
      .then((out) => {
        res.send(new res.Response(out))
      })
      .catch(res.handleError)
  })

  app.put('/users/me', [ core.session.authority ], (req, res) => {
    res.user.set(req.body)
      .then((out) => {
        res.send(new res.Response('ok'))
      })
      .catch(res.handleError)
  })

}
