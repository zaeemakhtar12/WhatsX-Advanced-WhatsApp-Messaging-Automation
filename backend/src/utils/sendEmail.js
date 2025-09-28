const { Resend } = require('resend');

const {
  RESEND_API_KEY,
  RESEND_FROM = 'WhatsX <onboarding@resend.dev>'
} = process.env;

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  if (!RESEND_API_KEY) {
    console.warn('Resend not configured. Missing: RESEND_API_KEY');
    throw new Error('Email service not configured: missing RESEND_API_KEY');
  }
  
  try {
    console.log(`Attempting to send email to: ${to}`);
    console.log(`Using Resend service`);
    
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: [to],
      subject,
      text,
      html
    });
    
    console.log('Email sent successfully:', result.data?.id);
    console.log('Full result:', JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error('Email sending error:', err.message);
    console.error('Full error:', err);
    throw new Error(`Failed to send email: ${err.message}`);
  }
}
module.exports = sendEmail;