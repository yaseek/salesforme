  
const nodemailer = require('nodemailer');

function Mailer () {
  this.transporter = null;
}
module.exports = Mailer;

Mailer.prototype.init = function (config) {
  this.transporter = nodemailer.createTransport(config);
}

Mailer.prototype.sendMail = function (mailOptions) {
  var mailer = this;

  if (!mailer.transporter) return Promise.reject('not init');

  return new Promise((resolve, reject) => {
    mailer.transporter.sendMail(mailOptions, (err, info) => {
      if (err) return reject(err);
      resolve(info);
    })
  });
}

/*
    return core.mailer.sendMail({
      from: core.config.admin.fromAddress,
      to: 'ab@izh.com',
      subject: 'Поздравляем с регистрацией',
      text: `
        Привет!

        Спасибо, что зарегистрировался
      `
    })

*/