'use strict';

const fs = require('fs');

const async = require('async'),
      uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres'),
      gm = require('gm');

const core = require('../'),
      db = core.db;

const UPLOADS = 'uploads',
      VIEW_UPLOADS = 'v_uploads';

function Uploads () {

}
module.exports = Uploads;

Uploads.prototype.save = function (files, user) {
  return new Promise((resolve, reject) => {

    async.mapSeries(files, (file, callback) => {

      var file_uuid = uuid.v4();

      db.pool.query(
          sql.insert(UPLOADS, {
            uuid: file_uuid,
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            destination: file.destination,
            fieldname: file.fieldname,
            size: file.size
          })
            .toParams()
        ).then(() => callback(null, file_uuid))
        .catch(callback);

    }, (err, fileids) => {
      if (err) return reject(err);
      resolve(fileids);
    });
  });
};

Uploads.prototype.getInfoById = function (id) {
  return db.pool.query(
      sql.select()
        .from(VIEW_UPLOADS)
        .where({uuid: id})
        .toParams()
    ).then((out) => {
      if (!out.rowCount) return Promise.reject('not found');
      return Promise.resolve(out.rows[0]);
    });
}

/*Uploads.prototype.getFilesBySubject = function (subject) {
  return db.pool.query(
      sql.select()
        .from(VIEW_UPLOADS)
        .where({subject: subject.uuid})
        .toParams()
    ).then((out) => out.rows);
}*/

Uploads.prototype.get = function (query) {
  var q = sql.select().from(VIEW_UPLOADS);

  core.sqlResolve(q, query);
  return db.pool.query(q.toParams());
}

Uploads.prototype.resize = function (filename, query) {
  console.log('RESIZE', filename, query);
  var postfix = `_h${query.h}_w${query.w}`;

  return new Promise((resolve, reject) => {
    fs.stat(filename + postfix, (err, stat) => {
      if (!err) return resolve();

      gm(filename)
        .resize(query.w || null, query.h || null)
        .autoOrient()
        .write(filename + postfix, (err) => {
          if (err) return reject(err);
          resolve();
        });

    });
  }).then(() => filename + postfix);
  //return Promise.resolve(filename);
}