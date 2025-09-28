const nodemailer = require('nodemailer');

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '587',
  SMTP_SECURE = 'false',
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

// Create transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: String(SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  connectionTimeout: 30_000,
  greetingTimeout: 15_000,
  socketTimeout: 30_000,
  tls: {
    rejectUnauthorized: false
  }
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
    console.log(`Using SMTP: ${SMTP_HOST}:${SMTP_PORT}, user: ${SMTP_USER}`);
    
    // Verify connection first
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
    const result = await transporter.sendMail({
      from: SMTP_FROM,
      to: to,
      subject: subject,
      text: text,
      html: html
    });
    
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (err) {
    console.error('Email sending error:', err.message);
    console.error('Full error:', err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
}
module.exports = sendEmail;