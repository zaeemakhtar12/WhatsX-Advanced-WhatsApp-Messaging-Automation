const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env;

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  if (!SENDGRID_API_KEY || !SENDGRID_SENDER) {
    console.warn('SendGrid not configured'); return;
  }
  try {
    await sgMail.send({ to, from: SENDGRID_SENDER, subject, text, html });
  } catch (err) {
    console.error('SendGrid error:', err?.response?.body || err.message);
    // do not rethrow – allow registration to continue
  }
}
module.exports = sendEmail;