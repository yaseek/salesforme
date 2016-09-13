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

function makeListQuery (query, isCount) {
  let q = isCount ? sql.select('count(*) cnt') : 
      (query.fields ? sql.select(query.fields) : sql.select());

  q.from(VIEW_BANNERS_active);
  return q;
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

Banners.prototype.getList = function (query) {
  //return Promise.resolve({total:0, items:[]});
  let fn = makeListQuery;
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
  ).then((out) => addCSRF(out.rows[0]))
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