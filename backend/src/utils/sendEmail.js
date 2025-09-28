const nodemailer = require('nodemailer');
const { SENDGRID_API_KEY, SENDGRID_SENDER } = process.env;

// Create transporter for Gmail SMTP (explicit host/port with timeouts)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: SENDGRID_SENDER, // Gmail address
    pass: SENDGRID_API_KEY // Gmail App Password
  },
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000
});

async function sendEmail({ to, subject, text, html }) {
  if (!SENDGRID_API_KEY || !SENDGRID_SENDER) {
    console.warn('Email service not configured');
    throw new Error('Email service not configured');
  }
  
  try {
    console.log(`Attempting to send email to: ${to}`);
    // Verify connection for clearer errors
    await transporter.verify();
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