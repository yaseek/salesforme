
const assert = require('assert');

const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres'),
      passwordHash = require('password-hash');

const USERS = 'users',
      USERS_SOCIAL = 'users_social',
      VIEW_USERS = 'v_users',
      VIEW_SOCIAL = 'v_users_social',
      VIEW_USERS_NATIVE = 'v_users_native';      

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
          email: data.email
        })
        .toParams()
    )
    .then((out) => {
      var method;
        if (!out.rowCount) {
          method = user.create;
        } else {
          console.log('METHOD UPDATE', out.rows[0]);
          user.setuuid(out.rows[0].user);
          method = user.update;
        }
      return method.call(user, { social: data })        
    })
    .then(() => {
      if (!!data.password) {
        return db.pool.query(
          sql.update(USERS, {
            password: user.setPassword(data.password)
          })
            .where({uuid: user.uuid})
            .toParams()
        )
      }
    })
    .then(() => resolve(user.uuid))
    //.catch(reject)
    .catch((err) => {
      console.log('ERRRR', err, err.stack);
      reject(err);
    })
  });
}

User.prototype.setuuid = function (uuid) {
  this.uuid = uuid;
  return this;
}

User.prototype.getRegs = function () {
  var user = this;
  return db.pool.query(
    sql.select()
      .from(VIEW_SOCIAL)
      .where({ user: user.uuid })
      .orderBy('authorized desc')
      .toParams()
  ).then((out) => {
    return out.rows;
  })
}

User.prototype.get = function () {
  var user = this;
  return db.pool.query(
    sql.select()
      .from(VIEW_USERS)
      .where({ uuid: user.uuid })
      .toParams()
  )
  .then((out) => out.rows[0])
  .then((out) => {
    return user.getRegs().then((regs) => {
      out.regs = regs;
      return out;
    })
  });
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
        user_id: data.social.user_id,
        email: data.social.email
      })
      .toParams()
    )
  })
  .then(() => user.uuid)
}

User.prototype.set = function (data) {
  var user = this;
  return db.pool.query(
    sql.update(USERS, {
      first_name: data.first_name,
      last_name: data.last_name
    })
    .toParams()
  )
  .then(() => {
    if (!!data.password) {
      return db.pool.query(
        sql.update(USERS, {
          password: user.setPassword(data.password)
        })
          .where({uuid: user.uuid})
          .toParams()
      )
    }
  })
}

User.prototype.update = function (data) {
  var user = this;
  console.log('UPDATE', data, user);

  return db.pool.query(
    sql.select()
      .from(USERS_SOCIAL)
      .where({
        user: user.uuid,
        type: data.social.type,
        user_id: data.social.user_id
      })
      .toParams()
  )
  .then((out) => {
    console.log('OUT', out.rowCount, out.rows);
    if (out.rowCount) {
      return db.pool.query(
        sql.update(USERS_SOCIAL, {
          email: data.social.email,
          authorized: new Date()
        })
        .where({ serial: out.rows[0].serial })
        .toParams()
      )
    } else {
      return db.pool.query( 
        sql.insert(USERS_SOCIAL, {
          user: user.uuid,
          type: data.social.type,
          user_id: data.social.user_id,
          email: data.social.email
        })
        .toParams()
      )
    }
  })

}

User.prototype.checkNotExistsUser = function (query) {
  var user = this;

  return db.pool.query(
    sql.select()
      .from(USERS_SOCIAL)
      .where(query)
      .toParams()
  ).then((out) => {
    if (!out.rowCount) return Promise.resolve();
    return Promise.reject();
  })
}

User.prototype.checkAuth = function (data) {
  var user = this;

  return db.pool.query(
    sql.select('uuid, password')
      .from(VIEW_USERS_NATIVE)
      .where({email: data.email})
      .toParams()
  )
  .then((out) => {
    if (!out.rowCount) return Promise.reject('undefined user');
    assert(user.checkPassword(data.password, out.rows[0].password),
      'user/password undefined');
    return out.rows[0].uuid;
  })
}

User.prototype.setPassword = function (plainPassword) {
  var user = this;
  return passwordHash.generate(plainPassword);  
}

User.prototype.checkPassword = function (plainPassword, cryptedPassword) {
  var user = this;
  return passwordHash.verify(plainPassword, cryptedPassword);
}

