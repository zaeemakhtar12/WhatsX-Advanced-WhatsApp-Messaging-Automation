// config/validateEnv.js
function validateEnvironment() {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_FROM'
  ];

  const missingVars = [];
  const warnings = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Check optional but recommended variables
  if (!process.env.NODE_ENV) {
    warnings.push('NODE_ENV not set, defaulting to development');
    process.env.NODE_ENV = 'development';
  }

  if (!process.env.PORT) {
    warnings.push('PORT not set, defaulting to 5000');
    process.env.PORT = '5000';
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
  }

  // Error on missing required variables
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   ${varName}`));
    console.error('\n💡 Create a .env file with the missing variables');
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

module.exports = { validateEnvironment }; 