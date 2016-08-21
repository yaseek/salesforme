
const assert = require('assert');

const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres');

const SHOPS = 'shops',
      VIEW_SHOPS = 'v_shops';

function Shop (uuid) {
  this.uuid = uuid;
}
module.exports = Shop;

Shop.prototype.getList = function (query) {
  var q = sql.select().from(VIEW_SHOPS);

  core.sqlResolve(q, query);

  return db.pool.query(q.toParams())
    .then((out) => out.rows);
}

Shop.prototype.getChildren = function (shop_id) {
  var shop = this;

  return db.pool.query(
    sql.select('uuid')
      .from(SHOPS)
      .where({parent: shop_id})
      .toParams()
  ).then((out) => out.rows.map((shop) => shop.uuid));
}

Shop.prototype.create = function (data) {
  var shop = this;
  shop.uuid = uuid.v4();
  return db.pool.query(
    sql.insert(SHOPS, {
      uuid: shop.uuid,
      parent: data.parent,
      title: data.title,
      phone: data.phone,
      address: data.address,
      href: data.href,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy: data.accuracy
    })
      .toParams()
  ).then(() => shop.uuid);
}

Shop.prototype.get = function () {
  var shop = this;
  return db.pool.query(
    sql.select()
      .from(VIEW_SHOPS)
      .where({ uuid: shop.uuid })
      .toParams()
  ).then((out) => out.rowCount 
    ? out.rows[0] 
    : Promise.reject({code:404, message: 'UNKNOWN_UUID'}));
}