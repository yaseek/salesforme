
const express = require('express');

const core = require('./core');

const app = express();

app.get(/\/.*/, function(req, res){
  //console.log('GET', req.path);
  var view = req.path.match(/\/(.*)/);
  //res.render('index', { view: view[1] });
  res.render(view[1] || 'index', { view: view[1] });
});

core.config.loadConfig(__dirname + '/etc/config.yaml')
  .then(() => {
    console.log('CONFIG', core.config);
    //app.engine('html', require('ejs').renderFile);
    app.set('view engine', core.config.templates.engine);
    app.set('views', core.config.templates.views);
    app.listen(process.env.PORT || 3000, 'localhost');    
  })


