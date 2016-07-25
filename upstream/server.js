
const express = require('express');

const core = require('./core');

const app = express();

function loadResources (app) {

  app.get(/^\/api\/v1\/.*/, (req, res) => {
    var matches = req.path.match(/^\/api\/v1\/(.*)/);
    res.redirect(`http://localhost:3000/${matches[1]}`);
  })

  app.get(/\/.*/, function(req, res){
    var view = req.path.match(/^\/(.*)/),
        modulename = (!view || !view[1].trim()) ? 'index' : view[1].trim();
    //console.log('TRY LOAD', modulename);
    try {
    res.render(modulename, { 
      view: view[1],
      q: req.query
    }, (err, html) => {
      res.set('Content-Type', 'text/html');
      if (err) {
        console.log(`Cannon get ${modulename} module`, err);
        res.status(404).send('not found ' + (view ? view[1] : 'unknown module'));
      } else {
        res.status(200).send(html);
      }
    });
    } catch (e) {
      console.log('Bad trying for', modulename);
      res.set('Content-Type', 'text/html');
      res.status(404).send(`The file named with ${modulename} cannot be found`);
    }
  });

}

function loadRedirects (app, redirects) {
  (redirects || []).forEach((item) => {
    app.get(item.resource, (req, res) => {
      res.redirect(item.redirect_uri);
    })
  })
}

core.config.loadConfig(__dirname + '/etc/config.yaml')
  .then(() => {
    console.log('CONFIG', core.config);
    //app.engine('html', require('ejs').renderFile);
    app.set('view engine', core.config.templates.engine);
    app.set('views', core.config.templates.views);
    console.log('Listening', process.env.PORT || core.config.binding.port, 'on',
      core.config.binding.host);    

    loadRedirects(app, core.config.redirect);
    loadResources(app);

    app.listen(process.env.PORT || core.config.binding.port, 
      core.config.binding.host);    
  })


