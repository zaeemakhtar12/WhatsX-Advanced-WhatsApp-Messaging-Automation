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
  requireTLS: false, // Try without requiring TLS first
  connectionTimeout: 60_000, // Even longer timeout
  greetingTimeout: 30_000,   // Longer greeting timeout
  socketTimeout: 60_000,     // Longer socket timeout
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates
    ciphers: 'SSLv3' // Try different cipher
  },
  pool: true, // Use connection pooling
  maxConnections: 1,
  maxMessages: 1
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
    
    // Try alternative Gmail SMTP settings if primary fails
    let currentTransporter = transporter;
    
    try {
      console.log('Verifying SMTP connection...');
      await currentTransporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyErr) {
      console.log('Primary SMTP failed, trying alternative Gmail settings...');
      
      // Try alternative Gmail SMTP configuration
      const altTransporter = nodemailer.createTransport({
        service: 'gmail', // Use service instead of host/port
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        },
        connectionTimeout: 30_000,
        greetingTimeout: 15_000,
        socketTimeout: 30_000
      });
      
      await altTransporter.verify();
      console.log('Alternative SMTP connection verified successfully');
      currentTransporter = altTransporter;
    }
    
    const result = await currentTransporter.sendMail({ 
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