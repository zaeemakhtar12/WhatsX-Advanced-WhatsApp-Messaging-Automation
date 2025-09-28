const nodemailer = require('nodemailer');

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '465',
  SMTP_SECURE = 'true',
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

// Create transporter for SMTP (defaults configured for Gmail)
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: String(SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 20_000
});

async function sendEmail({ to, subject, text, html }) {
  const missing = [
    ['SMTP_USER', SMTP_USER],
    ['SMTP_PASS', SMTP_PASS],
    ['SMTP_FROM', SMTP_FROM]
  ].filter(([_, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.warn(`SMTP not configured. Missing: ${missing.join(', ')}`);
    throw new Error(`Email service not configured: missing ${missing.join(', ')}`);
  }
  
  try {
    console.log(`Attempting to send email to: ${to}`);
    // Verify connection for clearer errors
    await transporter.verify();
    const result = await transporter.sendMail({ 
      to, 
      from: SMTP_FROM, 
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