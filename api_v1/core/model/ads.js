'use strict';

const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres');

const BANNERS = 'banners',
      VIEW_BANNERS = 'v_banners',
      VIEW_BANNERS_active = 'v_banners_active';

function Ads (uuid) {
  this.uuid = uuid;
}
module.exports = Ads;

Ads.prototype.tryCount = function (code) {
}