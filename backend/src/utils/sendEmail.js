const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_SENDER = process.env.SENDGRID_SENDER;

sgMail.setApiKey(SENDGRID_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  const msg = {
    to,
    from: SENDGRID_SENDER,
    subject,
    text,
    html,
  };
  await sgMail.send(msg);
}

module.exports = sendEmail; 