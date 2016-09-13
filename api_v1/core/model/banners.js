'use strict';

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

Banners.prototype.getList = function (query) {
  return Promise.resolve({total:0, items:[]});
}

Banners.prototype.get = function () {
  let banners = this;

  return Promise.resolve({total:0, items:[]});
}

Banners.prototype.create = function (data) {
  return Promise.resolve(uuid.v4());  
}