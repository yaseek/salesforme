
const core = require('../core');

module.exports = function (app) {

  app.get( '/actions', (req, res) => {

    var action = new core.Action();

    action.getList(req.query)
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

  app.post( '/actions', (req, res) => {

    var action = new core.Action();

    action.create(req.body)
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

  app.get( '/actions/:id', (req, res) => {

    var action = new core.Action(req.params.id);

    action.get()
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

  app.get( '/actions/:id/images', (req, res) => {

    var action = new core.Action(req.params.id);

    action.getImages()
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

  app.get( '/actions/:id/rating', (req, res) => {

    var action = new core.Action(req.params.id);

    action.getRating()
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

}