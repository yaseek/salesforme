
const express = require('express');

const core = require('./core');

const app = express();

app.get('/info', function(req, res){
  console.log('CONFIG', core.config.info);
  res.status(200).send(core.config.info);//.send('It is the API place');
});

core.config.loadConfig(__dirname + '/etc/config.yaml')
  .then(() => {
    app.listen(process.env.PORT || 4000, 'localhost');    
  })


