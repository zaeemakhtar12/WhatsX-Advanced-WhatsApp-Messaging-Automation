const nodemailer = require('nodemailer');

const {
  SMTP_HOST = 'smtp.gmail.com',
  SMTP_PORT = '587',
  SMTP_SECURE = 'false',
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM
} = process.env;

// Create transporter for Gmail SMTP with optimized settings for Render
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false, // Always use STARTTLS for port 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  connectionTimeout: 60_000, // Increased timeout
  greetingTimeout: 30_000,  // Increased timeout
  socketTimeout: 60_000,    // Increased timeout
  pool: true,               // Use connection pooling
  maxConnections: 1,        // Limit connections
  maxMessages: 3,           // Limit messages per connection
  rateDelta: 20000,         // Rate limiting
  rateLimit: 5,             // Max 5 emails per rateDelta
  tls: {
    rejectUnauthorized: false,
    ciphers: 'SSLv3'
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