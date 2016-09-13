'use strict';

const core = require('../core');

module.exports = function (app) {

  app.get('/banners', (req, res) => {

    let banners = new core.Banners();

    banners.getList(req.query)
      .then((out) => {
        var response = new res.Response(out.items);
        response.setTotal(out.total);
        res.status(200).send(response);
      })
      .catch(res.handleError);
  })

  app.post('/banners', (req, res) => {

    let banners = new core.Banners();

    banners.create(req.body)
      .then((uuid) => {
        res.status(200).send(new res.Response(uuid));
      })
      .catch(res.handleError);
  })

  app.get('/banners/:id', (req, res) => {

    let banners = new core.Banners(req.params.id);

    banners.get()
      .then((out) => {
        res.status(200).send(new res.Response(out));
      })
      .catch(res.handleError);
  })

}
