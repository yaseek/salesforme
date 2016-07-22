
const core = require('../'),
      db = core.db;

const uuid = require('node-uuid'),
      sql = require('sql-bricks-postgres');

function User (uuid) {
  this.uuid = uuid;
}
module.exports = User;

User.prototype.auth = function (data) {
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
      (function(){
        if (!out.rowCount) {
          return user.create({ social: data });
        } else {
          return user.update({ social: data });
        }
      }()).then(resolve, reject);
    })
    .catch(reject)
  });
}