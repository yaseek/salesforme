
const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres');

const USERS = 'users',
      USERS_SOCIAL = 'users_social',
      VIEW_USERS = 'v_users',
      VIEW_SOCIAL = 'v_users_social';      

function User (uuid) {
  this.uuid = uuid;
}
module.exports = User;

User.prototype.auth = function (data) {
  var user = this;
  return new Promise((resolve, reject) => {
    db.pool.query(
      sql.select()
        .from(VIEW_SOCIAL)
        .where({
          type: data.type,
          user_id: data.access_data.user_id
        })
        .toParams()
    )
    .then((out) => {
      var method;
        if (!out.rowCount) {
          method = user.create;
        } else {
          user.setuuid(out.rows[0].user);
          method = user.update;
        }
      return method({ social: data })
        .then(resolve, reject);
    })
    .catch(reject)
  });
}

User.prototype.setuuid = function (uuid) {
  this.uuid = uuid;
  return this;
}

User.prototype.create = function (data) {
  var user = this;
  user.uuid = uuid.v4();

  //console.log('CREATE USER', data);

  return db.pool.query(
    sql.insert(USERS, {
      uuid: user.uuid
    })
    .toParams()
  )
  .then(() => {
    return db.pool.query(
      sql.insert(USERS_SOCIAL, {
        user: user.uuid,
        type: data.social.type,
        user_id: data.social.access_data.user_id,
        email: data.social.access_data.email
      })
      .toParams()
    )
  })
  .then(() => user.uuid)
}

User.prototype.update = function (data) {
  var user = this;
  return db.pool.query(
    sql.update(USERS_SOCIAL, {
      user: user.uuid,
      type: data.social.type,
      user_id: data.social.access_data.user_id,
      email: data.social.access_data.email,
      authorized: new Date()
    })
    .where({ user: user.uuid })
    .toParams()
  )
}

