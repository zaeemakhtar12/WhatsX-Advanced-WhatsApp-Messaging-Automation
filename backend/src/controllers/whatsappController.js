const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const ResponseHandler = require('../utils/responseHandler');

// Store active sessions per user
const userSessions = new Map();

// Create WhatsApp client for a user
function createWhatsAppClient(userId) {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: `user-${userId}` }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-images',
        '--disable-javascript',
        '--disable-default-apps',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      timeout: 60000
    },
    webVersionCache: {
      type: 'remote',
      remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
  });

  return client;
}

// Wait for WhatsApp delivery acknowledgment by listening on the client
function waitForAckOnClient(client, messageId, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const onAck = (msg, ack) => {
      const id = msg?.id?._serialized || msg?.id;
      if (id === messageId) {
        client.removeListener('message_ack', onAck);
        clearTimeout(timer);
        resolve(ack);
      }
    };

    const timer = setTimeout(() => {
      client.removeListener('message_ack', onAck);
      reject(new Error('Ack timeout'));
    }, timeoutMs);

    client.on('message_ack', onAck);
  });
}

// POST /api/whatsapp/start-session
exports.startWhatsAppSession = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return ResponseHandler.unauthorized(res);

    // Check if user already has an active session
    if (userSessions.has(userId)) {
      const session = userSessions.get(userId);
      if (session.client && session.status === 'connected') {
        return ResponseHandler.success(res, {
          status: 'connected',
          message: 'WhatsApp session already active',
          phoneNumber: session.phoneNumber
        });
      }
    }

    // Create new client
    const client = createWhatsAppClient(userId);
    let qrCode = null;
    let sessionStatus = 'initializing';

    // Store session info
    userSessions.set(userId, {
      client,
      status: sessionStatus,
      phoneNumber: null,
      qrCode: null
    });

    // Handle QR code generation
    client.on('qr', async (qr) => {
      console.log(`QR Code generated for user ${userId}`);
      qrCode = qr;
      
      // Generate QR code image as base64 data URL
      try {
        const qrImageDataUrl = await QRCode.toDataURL(qr, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        userSessions.get(userId).qrCode = qrImageDataUrl;
        userSessions.get(userId).status = 'qr_ready';
        
        // Also log to terminal for debugging
        qrcode.generate(qr, { small: true });
      } catch (error) {
        console.error('Error generating QR code image:', error);
        userSessions.get(userId).qrCode = qr; // Fallback to text
        userSessions.get(userId).status = 'qr_ready';
      }
    });

    // Handle successful connection
    client.on('ready', () => {
      console.log(`WhatsApp client ready for user ${userId}`);
      const session = userSessions.get(userId);
      session.status = 'connected';
      session.phoneNumber = client.info.wid.user;
      session.qrCode = null;
    });

    // Handle authentication failure
    client.on('auth_failure', (msg) => {
      console.error(`Authentication failed for user ${userId}:`, msg);
      userSessions.get(userId).status = 'auth_failed';
    });

    // Handle disconnection
    client.on('disconnected', (reason) => {
      console.log(`WhatsApp client disconnected for user ${userId}:`, reason);
      userSessions.delete(userId);
    });

    // Initialize the client
    await client.initialize();

    // Wait a moment for QR code generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const session = userSessions.get(userId);
    
    return ResponseHandler.success(res, {
      status: session.status,
      qrCode: session.qrCode,
      message: session.status === 'qr_ready' ? 'Scan QR code with your WhatsApp' : 'Initializing...'
    });

  } catch (err) {
    console.error('WhatsApp session start error:', err);
    return ResponseHandler.error(res, 'Failed to start WhatsApp session', 500, err.message);
  }
};

// GET /api/whatsapp/status
exports.getWhatsAppStatus = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return ResponseHandler.unauthorized(res);

    const session = userSessions.get(userId);
    if (!session) {
      return ResponseHandler.success(res, {
        status: 'not_connected',
        message: 'No active WhatsApp session'
      });
    }

    return ResponseHandler.success(res, {
      status: session.status,
      qrCode: session.qrCode,
      phoneNumber: session.phoneNumber,
      message: session.status === 'connected' ? 'WhatsApp connected' : 
               session.status === 'qr_ready' ? 'Scan QR code' : 'Initializing...'
    });

  } catch (err) {
    return ResponseHandler.error(res, 'Failed to get WhatsApp status', 500, err.message);
  }
};

// POST /api/whatsapp/stop-session
exports.stopWhatsAppSession = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return ResponseHandler.unauthorized(res);

    const session = userSessions.get(userId);
    if (session && session.client) {
      // Destroy the client first to release file locks on Windows
      try { await session.client.destroy(); } catch (e) { /* ignore */ }

      // Small delay to ensure Chromium releases file handles
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove persisted auth folder (with retries to avoid EBUSY on Windows)
      const fs = require('fs');
      const path = require('path');
      const authDir = path.join(process.cwd(), '.wwebjs_auth', `session-user-${userId}`);

      const tryRemoveDirWithRetries = async (targetPath, retries = 5, delayMs = 300) => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            if (fs.existsSync(targetPath)) {
              fs.rmSync(targetPath, { recursive: true, force: true });
            }
            return true;
          } catch (err) {
            const isBusy = /EBUSY|EPERM|ENOTEMPTY/i.test(String(err && err.code || err.message));
            if (attempt === retries || !isBusy) {
              console.warn(`Failed to clear auth directory (attempt ${attempt}/${retries}):`, err.message);
              return false;
            }
            await new Promise(r => setTimeout(r, delayMs));
          }
        }
      };

      await tryRemoveDirWithRetries(authDir);

      userSessions.delete(userId);
    }

    return ResponseHandler.success(res, {
      message: 'WhatsApp session stopped'
    });

  } catch (err) {
    return ResponseHandler.error(res, 'Failed to stop WhatsApp session', 500, err.message);
  }
};

// Send message via WhatsApp Web
exports.sendWhatsAppMessage = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return ResponseHandler.unauthorized(res);

    const { recipient, message } = req.body;
    if (!recipient || !message) {
      return ResponseHandler.validationError(res, { message: 'Recipient and message are required' });
    }

    const session = userSessions.get(userId);
    if (!session || session.status !== 'connected') {
      return ResponseHandler.error(res, 'WhatsApp not connected', 400, 'Please connect your WhatsApp first');
    }

    // Clean and format recipient number
    let cleanNumber = recipient.replace(/\D/g, ''); // Remove all non-digits
    if (cleanNumber.startsWith('0')) {
      cleanNumber = cleanNumber.substring(1); // Remove leading 0
    }
    if (!cleanNumber.startsWith('92') && cleanNumber.length === 10) {
      cleanNumber = '92' + cleanNumber; // Add Pakistan country code if missing
    }
    
    const formattedNumber = `${cleanNumber}@c.us`;
    
    console.log(`Attempting to send message to: ${formattedNumber}`);
    
    // Check if the chat exists first
    const isRegistered = await session.client.isRegisteredUser(formattedNumber);
    if (!isRegistered) {
      return ResponseHandler.error(res, 'Recipient not found', 400, 'This WhatsApp number is not registered');
    }

    // Send message with retry logic
    let result;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        result = await session.client.sendMessage(formattedNumber, message);
        // Wait for server/device ack to ensure real send
        await waitForAckOnClient(session.client, result.id._serialized);
        break;
      } catch (sendError) {
        attempts++;
        console.error(`Send attempt ${attempts} failed:`, sendError.message);
        
        if (attempts >= maxAttempts) {
          throw sendError;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`Message sent successfully to ${formattedNumber}`);
    
    return ResponseHandler.success(res, {
      messageId: result.id._serialized,
      message: 'Message sent successfully',
      recipient: formattedNumber
    });

  } catch (err) {
    console.error('WhatsApp send message error:', err);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send message';
    if (err.message.includes('Evaluation failed')) {
      errorMessage = 'WhatsApp Web session may be unstable. Please try reconnecting.';
    } else if (err.message.includes('not registered')) {
      errorMessage = 'Recipient WhatsApp number is not registered';
    } else if (err.message.includes('timeout')) {
      errorMessage = 'Message sending timed out. Please try again.';
    }
    
    return ResponseHandler.error(res, errorMessage, 500, err.message);
  }
};

// Get WhatsApp client for a user (helper function)
function getWhatsAppClient(userId) {
  const session = userSessions.get(userId);
  return session && session.status === 'connected' ? session.client : null;
}

module.exports = {
  startWhatsAppSession: exports.startWhatsAppSession,
  getWhatsAppStatus: exports.getWhatsAppStatus,
  stopWhatsAppSession: exports.stopWhatsAppSession,
  sendWhatsAppMessage: exports.sendWhatsAppMessage,
  getWhatsAppClient,
  // export helper for reuse in scheduler when needed
  _waitForAckOnClient: waitForAckOnClient
};
