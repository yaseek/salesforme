const express = require('express');
const app = express();

app.get('/', function(req, res){
  res.status(200).send('It is the API place');
});

app.listen(process.env.PORT || 4000);

