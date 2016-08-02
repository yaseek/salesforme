
const core = require('../core');

module.exports = function (app) {

  app.get( '/shops', (req, res) => {

    var shop = new core.Shop();

    shop.getList(req.query)
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

  app.get( '/shops/:id', (req, res) => {

    var shop = new core.Shop(req.params.id);

    shop.get()
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

  app.post( '/shops', (req, res) => {

    var shop = new core.Shop();

    shop.create(req.body)
      .then((out) => {
        res.send(new res.Response(out));
      })
      .catch(res.handleError);
  });

}