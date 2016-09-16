'use strict';

const _ = require('underscore');

const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres');

const BANNERS = 'banners',
      VIEW_BANNERS = 'v_banners',
      VIEW_BANNERS_active = 'v_banners_active';

function Banners (uuid) {
  this.uuid = uuid;
}
module.exports = Banners;

function makeListQuery (tbl) {
  return function (query, isCount) {
    let q = isCount ? sql.select('count(*) cnt') : 
        (query.fields ? sql.select(query.fields) : sql.select());

    q.from(tbl);
    return q;
  }
}

function getList (fn, query) {
  let q = fn(query);

  core.sqlResolve(q, query);

  return db.pool.query(q.toParams())
    .then((out) => out.rows);
}

function getListCount (fn, query) {
  let q = fn(query, true);

  core.sqlResolve(q, {
    filters: (query || {}).filters
  });

  return db.pool.query(q.toParams())
    .then((out) => out.rows[0].cnt);
}

function addCSRF (banner) {
  banner.code = core.csrf.makeCSRF(banner.uuid);
  return banner;
}

Banners.prototype.getList = function (query, user) {
  //return Promise.resolve({total:0, items:[]});
  let fn = !!user ? makeListQuery(VIEW_BANNERS) : makeListQuery(VIEW_BANNERS_active);
  return getList(fn, query)
    .then((list) => {
      return getListCount(fn, query)
        .then((count) => { 
          return {items: list.map(addCSRF), total: Number(count)}
        })
    })
}

Banners.prototype.get = function () {
  let banners = this;
  
  return db.pool.query(
    sql.select()
      .from(VIEW_BANNERS)
      .where({uuid: banners.uuid})
      .toParams()
  ).then((out) => {
    if (!out.rowCount) return Promise.reject({code: 404})
    addCSRF(out.rows[0]);
    return out.rows[0];
  })
}

Banners.prototype.create = function (data) {
  let model = _.pick(data, 
      'image',
      'type',
      'start_time',
      'end_time',
      'description',
      'link'
    )
  model.uuid = uuid.v4();

  return db.pool.query(
    sql.insert(BANNERS, model)
    .toParams()
  ).then(() => model.uuid);
}

Banners.prototype.update = function (data) {
  let banners = this;
  let model = _.pick(data, 
      'image',
      'type',
      'start_time',
      'end_time',
      'description',
      'link'
    )

  return db.pool.query(
    sql.update(BANNERS, model)
      .where({uuid: banners.uuid})
    .toParams()
  );
}

Banners.prototype.delete = function (data) {
  let banners = this;

  return db.pool.query(
    sql.delete()
      .from(BANNERS)
      .where({uuid: banners.uuid})
    .toParams()
  );
}

