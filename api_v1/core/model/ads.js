'use strict';

const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres');

const BANNERS = 'banners',
      BANNERS_ACTIONS = 'banners_actions',
      VIEW_BANNERS = 'v_banners',
      VIEW_BANNERS_active = 'v_banners_active';

function Ads (uuid) {
  this.uuid = uuid;
}
module.exports = Ads;

Ads.prototype.tryCount = function (csrf_data, code, ip) {
  //console.log('TRY COUNT', csrf_data);
  if (!csrf_data.checked) return;

  db.pool.query(
    sql.insert(BANNERS_ACTIONS, {
      banner: csrf_data.uuid,
      itime: csrf_data.time,
      action: code,
      ip: ip
    })
    .toParams()
  )
}