
const core = require('../core')

module.exports = function (app) {

  app.get('/users/me', [ 
    core.session.authority, 
    core.session.restrictUser
  ], (req, res) => {
    req.user.get()
      .then((out) => {
        res.send(new res.Response(out))
      })
      .catch(res.handleError)
  })

  app.put('/users/me', [ 
    core.session.authority, 
    core.session.restrictUser
  ], (req, res) => {
    req.user.set(req.body)
      .then((out) => {
        res.send(new res.Response('ok'))
      })
      .catch(res.handleError)
  })

}
