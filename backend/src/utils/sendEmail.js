const sgMail = require('@sendgrid/mail');
const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env;

if (SENDGRID_API_KEY) sgMail.setApiKey(SENDGRID_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  if (!SENDGRID_API_KEY || !SENDGRID_SENDER) {
    console.warn('SendGrid not configured');
    throw new Error('Email service not configured');
  }
  
  try {
    console.log(`Attempting to send email to: ${to}`);
    const result = await sgMail.send({ 
      to, 
      from: SENDGRID_SENDER, 
      subject, 
      text, 
      html 
    });
    console.log('Email sent successfully:', result[0].statusCode);
    return result;
  } catch (err) {
    console.error('SendGrid error:', err?.response?.body || err.message);
    throw new Error(`Failed to send email: ${err?.response?.body?.errors?.[0]?.message || err.message}`);
  }
}
module.exports = sendEmail;