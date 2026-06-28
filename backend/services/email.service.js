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

// Real email is sent whenever valid SMTP credentials are configured —
// regardless of NODE_ENV. If they're missing/placeholder, the OTP is logged
// to the console so the app stays testable without SMTP.
function emailConfigured() {
  const { user, pass } = config.email;
  return user && pass && !user.includes('your_email') && !pass.includes('your_app_password');
}

async function sendOtp(toEmail, otp, name) {
  if (!emailConfigured()) {
    logger.info(`[DEV] OTP for ${toEmail}: ${otp}`);
    return false;
  }
  const firstName = (name || 'Dost').split(' ')[0];
  try {
  await getTransporter().sendMail({
    from: `"Dekho Mai Aagya! 🙋" <${config.email.user}>`,
    to: toEmail,
    subject: `${firstName}, OTP daalo aur bolo "Dekho Mai Aagya!" 🎯`,
    html: `
      <div style="font-family:sans-serif;max-width:440px;margin:auto;border:1px solid #eee;border-radius:14px;overflow:hidden">
        <div style="background:#0C447C;color:#fff;padding:20px 24px">
          <div style="font-size:20px;font-weight:600">🙋 Dekho Mai Aagya!</div>
          <div style="font-size:13px;color:#B5D4F4">Haaziri lagao, jhanjhat bhagao</div>
        </div>
        <div style="padding:24px">
          <p style="font-size:16px;margin:0 0 6px">Arre <b>${firstName}</b>! 👋</p>
          <p style="color:#444;margin:0 0 18px">Attendance lagani hai? Pehle ye secret code daalo, phir kaho zor se — <i>"Dekho Mai Aagya!"</i> 😎</p>
          <div style="background:#E6F1FB;border-radius:10px;text-align:center;padding:18px 0;margin-bottom:18px">
            <span style="font-size:2.4rem;letter-spacing:10px;font-weight:bold;color:#0C447C">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px;margin:0">Ye code 10 minute me gayab ho jayega ⏳. Kisi ko mat batana, warna woh tumhari jagah "aa jayega" 🤫</p>
        </div>
        <div style="background:#f7f7f5;color:#999;font-size:11px;text-align:center;padding:12px">Dekho Mai Aagya! · attendance ka baadshah 👑</div>
      </div>
    `,
  });
  logger.info(`OTP email sent to ${toEmail}`);
  return true;
  } catch (err) {
    logger.error(`OTP email failed for ${toEmail}: ${err.message}`);
    return false;
  }
}

module.exports = { sendOtp };
