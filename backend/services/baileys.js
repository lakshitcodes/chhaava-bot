// backend/services/baileys.js
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');
const { processIncomingMessage } = require('./llmService');
const User = require('../models/User');

// Auth credentials directory
const AUTH_FOLDER = path.join(__dirname, '../.auth');

// Ensure auth directory exists
if (!fs.existsSync(AUTH_FOLDER)) {
  fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

// Initialize WhatsApp connection
let sock = null;

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
        console.log('WhatsApp connection opened!');
      }
    });
    
    // Handle incoming messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const message of messages) {
        if (message.key.fromMe) continue; // Skip own messages
        
        // Extract JID (remove device part if present)
        const jid = message.key.remoteJid;
        
        // Check if there's a text message
        if (message.message && 
           (message.message.conversation || 
            (message.message.extendedTextMessage && 
             message.message.extendedTextMessage.text))) {
          
          const text = message.message.conversation || 
                      message.message.extendedTextMessage.text;
          
          console.log(`New message from ${jid}: ${text}`);
          
          // Update or create user in database
          await updateUserFromMessage(jid, message);
          
          // Process message with LLM and get response
          const response = await processIncomingMessage(jid, text);
          
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
      // Create new user
      user = new User({
        jid,
        name: pushName,
        isGroup: jid.endsWith('@g.us'),
        phone: jid.split('@')[0],
        lastInteraction: new Date()
      });
      await user.save();
      console.log(`Created new user: ${jid}`);
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

module.exports = {
  initWhatsApp,
  sendMessage,
  sendBroadcast
};