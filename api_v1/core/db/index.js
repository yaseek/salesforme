'use strict';

const pg = require('pg-then');

var vsprintf = require("sprintf-js").vsprintf;

function init (options) {
  return new Promise(function(resolve, reject) {
    var connstring = vsprintf("postgres://%s:%s@%s:%d/%s", [
        options.user,
        options.password,
        options.host,
        options.port || 5432,
        options.database
      ]);
    console.log('Initializing database', connstring);

    //module.exports.pool = pg.Pool(connstring);
    var config = {
      user: options.user, //env var: PGUSER
      database: options.database, //env var: PGDATABASE
      password: options.password, //env var: PGPASSWORD
      host: options.host,
      port: options.port || 5432, //env var: PGPORT
      max: options.connections, // max number of clients in the pool
      idleTimeoutMillis: options.idleTimeout, // how long a client is allowed to remain idle before being closed
    };

    //resolve(pg.Pool(connstring));
    resolve(pg.Pool(config));
  });
}
module.exports.init = init;

//module.exports.Transaction = require('./transaction');
