
function Response (data, error) {
  var self = this;

  this.meta = {};

  //console.log('TTT', typeof data);

  if (typeof data !== 'undefined') {
    this.result = data;
  }

  if (typeof error !== 'undefined') {
    setError(error);
  }

  if (Array.isArray(data)) {
    setTotal(data.length);
  }

  function setTotal (count) {
    self.meta.total = count;
  }
  this.setTotal = setTotal;

  function setMeta (data) {
    self.meta = data;
  }
  this.setMeta = setMeta;

  function setError (message) {
    self.error = String(message);
  }
  this.setError = setError;
}

Response.prototype.toString = function () {
  return JSON.stringify(this);
}

function handleError(res) {
  return function(out) {
    var errMessage;
    console.log('ERR', out);
    if (typeof out === 'object') {
      errMessage = out.message || out.Message || undefined;
    } else {
      errMessage = out.toString();
    }
    var code = (out.code && out.code >= 100 && out.code < 1000) ? out.code : 500;
    var data = new Response(out, errMessage || 'internal server error');
    //console.log('ERRDATA', out.code, data);
    res.status(code).send(data);
  }
}

module.exports.prepare = function (req, res, next) {
  res.set('Content-Type', 'application/json');
  res.Response = Response;
  res.handleError = handleError(res);

  next();
};

