
const assert = require('assert');

const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      async = require('async'),
      sql = require('sql-bricks-postgres');

const ACTIONS = 'actions',
      ACTIONS_IMAGES = 'actions_images',
      ACTIONS_RATING = 'actions_rating',
      SHOP_ACTIONS = 'shop_actions',
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

Action.prototype.create = function (data, user) {
  var action = this;
  action.uuid = uuid.v4();
  return db.pool.query(
    sql.insert(ACTIONS, {
      uuid: action.uuid,
      title: data.title,
      category: data.category,
      cat2gis: null,
      description: data.description,
      discount_value: Number(data.discount_value),
      discount_min: Number(data.discount_min),
      discount_max: Number(data.discount_max),
      expiration_begin: !data.expiration_begin ? new Date() : new Date(data.expiration_begin),
      expiration_end: !data.expiration_end ? new Date() : new Date(data.expiration_end),
      user: user.uuid
    })
      .toParams()
  )
  .then(() => {
    return db.pool.query(
      sql.insert(SHOP_ACTIONS, {
        shop: data.shop,
        action: action.uuid
      })
      .toParams()
    )
  })
  .then(() => action.uuid);
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

/**
  images -- array of upload ids
  */
Action.prototype.addImages = function (images, user) {
  var action = this;
  async.eachSeries(images || [], (upload_id, callback) => {
    db.pool.query(
      sql.insert(ACTIONS_IMAGES, {
        action: action.uuid,
        upload: upload_id,
        user: user.uuid
      })
      .toParams()
    )
    .then(() => callback())
    .catch((err) => callback(err));
  }, (err) => {
    if (err) return Promise.reject(err);
    Promise.resolve();
  });
}

Action.prototype.incViews = function () {
  var action = this;

  return db.pool.query(
    sql.update(ACTIONS, {
      views: sql('views + 1')
    })
    .where({uuid: this.uuid})
    .toParams()
  )
}

/**
  images -- array of upload ids
  data
    comment
    rating -- numeric value
  */
Action.prototype.addRating = function (data, user) {
  var action = this;

  if ((typeof data.rating === 'undefined') || isNaN(data.rating) ||
    data.rating < 0) return Promise.reject('BAD_RATING');
  return db.pool.query(
    sql.insert(ACTIONS_RATING, {
      action: action.uuid,
      user: user.uuid,
      rating: data.rating,
      comment: data.comment
    })
    .toParams()
  )
}

