'use strict'

// Third party modules
const multer = require('multer')

// Local modules
const core = require('../core'),
  config = core.config

function handleUpload (req, res, next) {
  var upload = multer({ dest: config.uploads.destination })
  return upload.any()(req, res, next)
}

module.exports = function (app) {
  /* app.get( '/api/uploads', (req, res) => {
    var uploads = new core.Uploads();

    uploads.getFilesBySubject(req.user.getData().subject)
      .then(function(out) {
        res.status(200).send(new res.Response(out));
      })
      .catch(res.handleError);
  });*/

  app.get('/uploads/:id', (req, res) => {
    var uploads = new core.Uploads()

    uploads.getInfoById(req.params.id)
      .then(function (out) {
        // console.log('GET', out);
        res.set('Content-Type', out.mimetype)
        var fileName = [out.destination, out.filename].join('/')
        res.sendFile(fileName)
      })
      .catch(res.handleError)
  })

  app.get('/uploads/:id/info', (req, res) => {
    var uploads = new core.Uploads()

    uploads.getInfoById(req.params.id)
      .then(function (out) {
        res.status(200).send(new res.Response(out))
      })
      .catch(res.handleError)
  })

  app.get('/uploads/:id/resized', (req, res) => {
    var uploads = new core.Uploads()

    uploads.getInfoById(req.params.id)
      .then((out) => {
        if (!out.mimetype.match(/^image/)) {
          return Promise.reject('not resizable content')
        }
        res.set('Content-Type', out.mimetype)
        return out
      })
      .then(function (out) {
        var fileName = [out.destination, out.filename].join('/')

        // console.log('RESIZED');
        if (!req.query.h && !req.query.w) return fileName

        return uploads.resize(fileName, req.query)
        // res.status(200).send(new res.Response(out));
      })
      .then((fileName) => {
        // console.log('FILENAME', fileName);
        res.sendFile(fileName)
      })
      .catch(res.handleError)
  })

  app.post('/uploads', [ 
    core.session.authority,
    core.session.restrictUser,
    handleUpload 
  ],
    (req, res) => {
      var uploads = new core.Uploads()

      uploads.save(req.files, req.user)
      .then(function (out) {
        res.status(200).send(new res.Response(out))
      })
      .catch(res.handleError)
    })
}
