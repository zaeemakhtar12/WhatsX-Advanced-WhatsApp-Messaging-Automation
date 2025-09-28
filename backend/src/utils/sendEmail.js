const nodemailer = require('nodemailer');
const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env;

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDGRID_SENDER, // Your Gmail address
    pass: SENDGRID_API_KEY // Your Gmail app password
  }
});

async function sendEmail({ to, subject, text, html }) {
  if (!SENDGRID_API_KEY || !SENDGRID_SENDER) {
    console.warn('Email service not configured');
    throw new Error('Email service not configured');
  }
  
  try {
    console.log(`Attempting to send email to: ${to}`);
    const result = await transporter.sendMail({ 
      to, 
      from: SENDGRID_SENDER, 
      subject, 
      text, 
      html 
    });
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (err) {
    console.error('Email sending error:', err.message);
    throw new Error(`Failed to send email: ${err.message}`);
  }
}
module.exports = sendEmail;