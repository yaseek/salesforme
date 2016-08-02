
const assert = require('assert');

const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres');

const ACTIONS = 'actions',
      VIEW_ACTIONS = 'v_actions',
      VIEW_ACTIONS_IMAGES = 'v_actions_images',
      VIEW_ACTIONS_RATING = 'v_actions_rating';

function Action (uuid) {
  this.uuid = uuid;
}
module.exports = Action;

Action.prototype.getList = function (query) {
  var q = sql.select().from(VIEW_ACTIONS);

  core.sqlResolve(q, query);

  return db.pool.query(q.toParams())
    .then((out) => out.rows);
}

Action.prototype.create = function (data) {
  var action = this;
  action.uuid = uuid.v4();
  return db.pool.query(
    sql.insert(ACTIONS, {
      uuid: action.uuid,
      title: data.title,
      category: data.category,
      cat2gis: null,
      shop: data.shop,
      description: data.description,
      discount_value: data.discount_value,
      discount_min: data.discount_min,
      discount_max: data.discount_max,
      expiration_begin: new Date(data.expiration_begin),
      expiration_end: new Date(data.expiration_end)
    })
      .toParams()
  ).then(() => action.uuid);
}

Action.prototype.get = function () {
  var action = this;
  return db.pool.query(
    sql.select()
      .from(VIEW_ACTIONS)
      .where({ uuid: action.uuid })
      .toParams()
  )
  .then((out) => out.rowCount 
    ? out.rows[0] 
    : Promise.reject({code:404, message: 'UNKNOWN_UUID'}))
  .then((data) => {
    return action.getImages()
      .then((list) => {
        data.images = list;
        return data;
      })
  })
  .then((data) => {
    var shop = new core.Shop(data.shop)
    return shop.get()
      .then((out) => {
        data.shop = out;
        return data;
      })
  })

}

Action.prototype.getImages = function () {
  var action = this;

  return db.pool.query(
    sql.select()
      .from(VIEW_ACTIONS_IMAGES)
      .where({action: action.uuid})
      .toParams()
  ).then((out) => out.rows.map((item) => item.upload));
}

Action.prototype.getRating = function () {
  var action = this;

  return db.pool.query(
    sql.select()
      .from(VIEW_ACTIONS_RATING)
      .where({action: action.uuid})
      .toParams()
  ).then((out) => out.rows);
}