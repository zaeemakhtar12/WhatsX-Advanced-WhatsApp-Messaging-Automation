// Modern email templates for WhatsX

const getVerificationEmailTemplate = (otp, username = 'User') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsX Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .otp-container {
            background: #f8fafc;
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .otp-label {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: #25d366;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
        }
        
        .otp-expiry {
            font-size: 14px;
            color: #ef4444;
            font-weight: 500;
        }
        
        .instructions {
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .instructions h3 {
            color: #0c4a6e;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .instructions ul {
            color: #0369a1;
            font-size: 14px;
            padding-left: 20px;
        }
        
        .instructions li {
            margin-bottom: 5px;
        }
        
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #25d366;
            text-decoration: none;
            font-size: 14px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .otp-code {
                font-size: 28px;
                letter-spacing: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">WX</div>
            <h1>WhatsX</h1>
            <p>WhatsApp Bulk Messaging Platform</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
                Welcome to WhatsX! We're excited to have you join our platform for efficient WhatsApp bulk messaging. 
                To complete your registration and secure your account, please verify your email address using the code below.
            </div>
            
            <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="otp-expiry">⏰ Expires in 10 minutes</div>
            </div>
            
            <div class="instructions">
                <h3>📱 How to verify:</h3>
                <ul>
                    <li>Copy the 6-digit code above</li>
                    <li>Return to the WhatsX verification page</li>
                    <li>Paste or type the code in the verification field</li>
                    <li>Click "Verify Email" to complete registration</li>
                </ul>
            </div>
            
            <div class="security-note">
                <p>🔒 <strong>Security Note:</strong> Never share this code with anyone. WhatsX will never ask for your verification code via phone or email.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Welcome to WhatsX!</strong></p>
            <p>Your trusted platform for WhatsApp bulk messaging</p>
            <p>Built with ❤️ for efficient business communication</p>
            
            <div class="social-links">
                <a href="#">Support</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                This email was sent to you because you registered for a WhatsX account. 
                If you didn't create this account, please ignore this email.
            </p>
        </div>
    </div>
</body>
</html>
  `;
};

const getPasswordResetEmailTemplate = (resetToken, username = 'User') => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsX Password Reset</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            padding: 16px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔒</div>
            <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username}! 👋</div>
            
            <div class="message">
                We received a request to reset your WhatsX account password. If you made this request, 
                click the button below to reset your password. This link will expire in 1 hour for security.
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}" class="button">
                    🔑 Reset My Password
                </a>
            </div>
            
            <div class="security-note">
                <p>🔒 <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>WhatsX Security Team</strong></p>
            <p>Your trusted platform for WhatsApp bulk messaging</p>
        </div>
    </div>
</body>
</html>
  `;
};

const getAdminRequestNotificationTemplate = (username, email, businessName, businessType, contactNumber, reasonForAdminAccess) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Admin Request - WhatsX</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .content {
            padding: 30px;
        }
        
        .info-grid {
            display: grid;
            gap: 15px;
            margin: 20px 0;
        }
        
        .info-item {
            display: flex;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
            min-width: 120px;
        }
        
        .info-value {
            color: #6b7280;
            flex: 1;
        }
        
        .reason-section {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .reason-section h3 {
            color: #0c4a6e;
            margin-bottom: 10px;
        }
        
        .reason-text {
            color: #0369a1;
            line-height: 1.6;
        }
        
        .footer {
            background: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
        }
        
        .timestamp {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Admin Access Request</h1>
            <p>WhatsX Platform</p>
        </div>
        
        <div class="content">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                A new admin access request has been submitted and requires your review.
            </p>
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">${username}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email:</div>
                    <div class="info-value">${email}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Business Name:</div>
                    <div class="info-value">${businessName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Business Type:</div>
                    <div class="info-value">${businessType}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Contact:</div>
                    <div class="info-value">${contactNumber}</div>
                </div>
            </div>
            
            <div class="reason-section">
                <h3>📝 Reason for Admin Access</h3>
                <div class="reason-text">${reasonForAdminAccess}</div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>WhatsX Admin Team</strong></p>
            <p>Please review this request in the admin panel</p>
            <div class="timestamp">Request submitted: ${new Date().toLocaleString()}</div>
        </div>
    </div>
</body>
</html>
  `;
};

const getAdminApprovalTemplate = (username, email) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Access Approved - WhatsX</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .success-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .login-details {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .login-details h3 {
            color: #0c4a6e;
            margin-bottom: 15px;
        }
        
        .login-item {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #e0f2fe;
        }
        
        .login-item:last-child {
            border-bottom: none;
        }
        
        .login-label {
            font-weight: 600;
            color: #374151;
            min-width: 80px;
        }
        
        .login-value {
            color: #6b7280;
        }
        
        .next-steps {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .next-steps h3 {
            color: #92400e;
            margin-bottom: 10px;
        }
        
        .next-steps ul {
            color: #b45309;
            padding-left: 20px;
        }
        
        .next-steps li {
            margin-bottom: 5px;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1>Admin Access Approved!</h1>
            <p>Welcome to the WhatsX Admin Team</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username}! 🎉</div>
            
            <div class="message">
                Great news! Your request for admin access to WhatsX has been <strong>approved</strong>! 
                You now have full administrative privileges and can manage the platform.
            </div>
            
            <div class="login-details">
                <h3>🔑 Your Login Details</h3>
                <div class="login-item">
                    <div class="login-label">Email:</div>
                    <div class="login-value">${email}</div>
                </div>
                <div class="login-item">
                    <div class="login-label">Password:</div>
                    <div class="login-value">(the password you provided during registration)</div>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>🚀 Next Steps</h3>
                <ul>
                    <li>Log in to your WhatsX admin account</li>
                    <li>Explore the admin dashboard</li>
                    <li>Review user management features</li>
                    <li>Set up your admin preferences</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Welcome to the WhatsX Admin Team!</strong></p>
            <p>Your trusted platform for WhatsApp bulk messaging</p>
            <p>Best regards,<br>WhatsX Team</p>
        </div>
    </div>
</body>
</html>
  `;
};

const getAdminRejectionTemplate = (username) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Access Request - WhatsX</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .info-box {
            background: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .info-box h3 {
            color: #0c4a6e;
            margin-bottom: 10px;
        }
        
        .info-box p {
            color: #0369a1;
            margin: 0;
        }
        
        .alternative {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .alternative h3 {
            color: #92400e;
            margin-bottom: 10px;
        }
        
        .alternative ul {
            color: #b45309;
            padding-left: 20px;
        }
        
        .alternative li {
            margin-bottom: 5px;
        }
        
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="icon">📋</div>
            <h1>Admin Access Request</h1>
            <p>WhatsX Platform</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${username},</div>
            
            <div class="message">
                Thank you for your interest in WhatsX admin access. We appreciate you taking the time to submit your request and share your business details with us.
            </div>
            
            <div class="info-box">
                <h3>📝 Request Status</h3>
                <p>After careful review of your application, we regret to inform you that your request for admin access has <strong>not been approved</strong> at this time.</p>
            </div>
            
            <div class="alternative">
                <h3>💡 Alternative Options</h3>
                <ul>
                    <li>Continue using WhatsX as a regular user</li>
                    <li>Explore our premium features for enhanced messaging</li>
                    <li>Contact our support team for assistance</li>
                    <li>Submit a new request in the future with additional business details</li>
                </ul>
            </div>
            
            <p style="color: #6b7280; margin-top: 20px;">
                We appreciate your understanding and look forward to serving you as a valued WhatsX user.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Thank you for choosing WhatsX!</strong></p>
            <p>Your trusted platform for WhatsApp bulk messaging</p>
            <p>Best regards,<br>WhatsX Team</p>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getAdminRequestNotificationTemplate,
  getAdminApprovalTemplate,
  getAdminRejectionTemplate
};
