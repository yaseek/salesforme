
const path = require('path');

const express = require('express');

const morgan = require('morgan'),
      cors = require('cors'),
      bodyParser = require('body-parser');

const core = require('./core');

const app = express();

app.use(cors());
app.use(morgan('short'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(core.response.prepare);

app.get('/info', function(req, res){
  console.log('CONFIG', core.config.info);
  res.status(200).send(core.config.info);//.send('It is the API place');
});

core.config.loadConfig(__dirname + '/etc/config.yaml')
  .then(() => {
    return core.db.init(core.config.postgres);
  })
  .then(() => {
    return core.session.init(core.config.session);
  })
  .then(() => {
    core.mailer.init(core.config.mail);
  })
  .then(() => {
    //app.all('*', core.http.response.prepare);
    //app.all('/api/*', core.http.auth.requireAuth);

    core.loadResources(app, path.resolve('./resources'));

    console.log('Listening', process.env.PORT || core.config.binding.port, 'on',
      core.config.binding.host);    
    app.listen(process.env.PORT || core.config.binding.port, 
      core.config.binding.host);    
  })
  .catch(console.log);


