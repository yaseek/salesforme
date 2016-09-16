'use strict';

const core = require('../core');

module.exports = function (app) {

  app.get('/banners', [
    core.session.authority
  ], (req, res) => {

    let banners = new core.Banners();

    banners.getList(req.query, req.user)
      .then((out) => {
        var response = new res.Response(out.items);
        response.setTotal(out.total);
        res.status(200).send(response);
      })
      .catch(res.handleError);
  })

  app.post('/banners', [
    core.session.authority,
    core.session.restrictUser
  ], (req, res) => {

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

  app.put('/banners/:id', [
    core.session.authority,
    core.session.restrictUser
  ], (req, res) => {

    let banners = new core.Banners(req.params.id);

    banners.update(req.body)
      .then((out) => {
        res.status(200).send(new res.Response('ok'));
      })
      .catch(res.handleError);
  })

  app.delete('/banners/:id', [
    core.session.authority,
    core.session.restrictUser
  ], (req, res) => {

    let banners = new core.Banners(req.params.id);

    banners.delete()
      .then((out) => {
        res.status(200).send(new res.Response('ok'));
      })
      .catch(res.handleError);
  })

}
