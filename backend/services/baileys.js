// backend/services/baileys.js
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, 
  downloadContentFromMessage, extractMessageContent, getContentType } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const { processIncomingMessage } = require('./llmService');
const { processLocationMessage } = require('./locationService');
const User = require('../models/User');

// Auth credentials directory
const AUTH_FOLDER = path.join(__dirname, '../.auth');

// Ensure auth directory exists
if (!fs.existsSync(AUTH_FOLDER)) {
fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

// Initialize WhatsApp connection
let sock = null;

// Store our WhatsApp ID when connected
let ourJid = '';

const initWhatsApp = async () => {
try {
const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

// Create WhatsApp socket connection
sock = makeWASocket({
printQRInTerminal: true,
auth: state,
markOnlineOnConnect: false,
defaultQueryTimeoutMs: 60000,
});

// Save credentials on update
sock.ev.on('creds.update', saveCreds);

// Handle connection updates
sock.ev.on('connection.update', async (update) => {
const { connection, lastDisconnect } = update;

if (connection === 'close') {
  const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
  console.log('WhatsApp connection closed due to ', lastDisconnect?.error);
  
  if (shouldReconnect) {
    console.log('Reconnecting WhatsApp...');
    initWhatsApp();
  } else {
    console.log('WhatsApp connection closed permanently.');
  }
} else if (connection === 'open') {
  // Store our JID when connected
  ourJid = sock.user.id;
  console.log('WhatsApp connection opened! Our JID:', ourJid);
}
});

// Handle incoming messages
sock.ev.on('messages.upsert', async ({ messages }) => {
for (const message of messages) {
  if (message.key.fromMe) continue; // Skip own messages
  
  // Extract JID (remove device part if present)
 // Updated section in backend/services/baileys.js
// Extract JID from message
const jid = message.key.remoteJid;

// Check if this JID is in our whitelist
const user = await User.findOne({ jid });

// Check both field names for whitelist status
const isWhitelisted = user && (user.whitelisted === true || user.isActive === true);

// Skip if user doesn't exist or is not in our whitelist
if (!user || !isWhitelisted) {
  console.log(`Skipping message from non-whitelisted JID: ${jid}`);
  continue;
}
  
  // Special handling for group messages
  if (jid.endsWith('@g.us')) {
    // Only process if:
    // 1. Message mentions us
    const mentionsUs = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(ourJid);
    
    // 2. Message quotes/replies to one of our messages
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
    const repliesTo = quotedParticipant === ourJid;
    
    // Skip if doesn't meet group criteria
    if (!mentionsUs && !repliesTo) {
      console.log(`Skipping group message that didn't mention or reply to us: ${jid}`);
      continue;
    }
  }
  
  // Extract message content
  const messageType = getContentType(message.message);
  
  // Handle location messages
  if (messageType === 'locationMessage') {
    const locationMsg = message.message.locationMessage;
    // Process location message specially
    if (locationMsg && locationMsg.degreesLatitude && locationMsg.degreesLongitude) {
      const location = {
        latitude: locationMsg.degreesLatitude,
        longitude: locationMsg.degreesLongitude,
        name: locationMsg.name || null,
        address: locationMsg.address || null
      };
      
      console.log(`Location received from ${jid}:`, location);
      
      // Process with location handler
      const response = await processLocationMessage(jid, location);
      
      // Send response back to user
      if (response) {
        await sendMessage(jid, response);
      }
    }
    continue;
  }
  
  // Handle text messages
  let textMessage = '';
  if (messageType === 'conversation') {
    textMessage = message.message.conversation;
  } else if (messageType === 'extendedTextMessage') {
    textMessage = message.message.extendedTextMessage.text;
  }
  
  if (textMessage) {
    console.log(`Text message from whitelisted JID ${jid}: ${textMessage}`);
    
    // Process message with LLM and get response
    const response = await processIncomingMessage(jid, textMessage);
    
    // Send response back to user
    if (response) {
      await sendMessage(jid, response);
    }
  }
}
});

} catch (error) {
console.error('Error initializing WhatsApp:', error);
}
};

// Update or create user from incoming message
const updateUserFromMessage = async (jid, message) => {
try {
// Check if user exists
let user = await User.findOne({ jid });

// Get push name if available
const pushName = message.pushName || '';

if (!user) {
// Create new user but NOT whitelisted by default
user = new User({
  jid,
  name: pushName,
  isGroup: jid.endsWith('@g.us'),
  phone: jid.split('@')[0],
  lastInteraction: new Date(),
  whitelisted: false // Not whitelisted by default
});
await user.save();
console.log(`Created new user: ${jid} (not whitelisted)`);
} else {
// Update existing user
user.lastInteraction = new Date();
if (pushName && !user.name) {
  user.name = pushName;
}
await user.save();
}

return user;
} catch (error) {
console.error('Error updating user from message:', error);
return null;
}
};

// Send message to WhatsApp user
const sendMessage = async (jid, text) => {
try {
if (!sock) {
console.error('WhatsApp socket not initialized');
return false;
}

await sock.sendMessage(jid, { text });
return true;
} catch (error) {
console.error('Error sending WhatsApp message:', error);
return false;
}
};

// Send message to multiple users (broadcast)
const sendBroadcast = async (jids, text) => {
const results = [];

for (const jid of jids) {
try {
const success = await sendMessage(jid, text);
results.push({ jid, success });
} catch (error) {
results.push({ jid, success: false, error: error.message });
}
}

return results;
};

// Get our JID
const getOurJid = () => {
return ourJid;
};

module.exports = {
initWhatsApp,
sendMessage,
sendBroadcast,
getOurJid
};