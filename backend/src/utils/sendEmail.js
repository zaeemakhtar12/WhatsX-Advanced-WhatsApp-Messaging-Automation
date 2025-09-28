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
  connectionTimeout: 30_000, // Increased timeout
  greetingTimeout: 15_000,   // Increased timeout
  socketTimeout: 30_000,     // Increased timeout
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
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
    
    // Verify connection for clearer errors
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');
    
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
    console.error('Full error:', err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
}
module.exports = sendEmail;