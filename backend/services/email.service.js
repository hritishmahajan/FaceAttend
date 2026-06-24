const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

// Singleton transporter — created once, reused for every email.
let _transporter = null;

function getTransporter() {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: { user: config.email.user, pass: config.email.pass },
    });
  }
  return _transporter;
}

async function sendOtp(toEmail, otp) {
  if (config.env !== 'production') {
    logger.info(`[DEV] OTP for ${toEmail}: ${otp}`);
    return;
  }
  await getTransporter().sendMail({
    from: `"FaceAttend" <${config.email.user}>`,
    to: toEmail,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family:sans-serif;max-width:400px">
        <h2>FaceAttend – Verification Code</h2>
        <p style="font-size:2rem;letter-spacing:8px;font-weight:bold">${otp}</p>
        <p style="color:#666">This code expires in 10 minutes. Do not share it.</p>
      </div>
    `,
  });
  logger.info(`OTP email sent to ${toEmail}`);
}

module.exports = { sendOtp };
