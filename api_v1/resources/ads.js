'use strict';

const core = require('../core');

module.exports = function (app) {

  app.get('/ads/:code/view', (req, res) => {
    let uploads = new core.Uploads(),
        ads = new core.Ads(),
        csrf_data = core.csrf.checkCSRF(req.params.code),
        banners = new core.Banners(csrf_data.uuid);
    
    banners.get()
      .then((banner) => {
        return uploads.getInfoById(banner.image)
      })
      .then(function (out) {
        // console.log('GET', out);
        res.set('Content-Type', out.mimetype)
        var fileName = [out.destination, out.filename].join('/')
        res.sendFile(fileName)
      })
      .then(() => ads.tryCount(csrf_data, 0, req.ip))
      .catch(res.handleError)    
  })

  app.get('/ads/:code', (req, res) => {

    let ads = new core.Ads();

    let csrf_data = core.csrf.checkCSRF(req.params.code),
        banners = new core.Banners(csrf_data.uuid);

    banners.get()
      .then((out) => res.redirect(302, out.link))
      .then(() => ads.tryCount(csrf_data, 1, req.ip))
      .catch(res.handleError)    
  })

}