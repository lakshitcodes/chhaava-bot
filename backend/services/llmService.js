// backend/services/llmService.js
const { callGroqApi, SYSTEM_PROMPTS, DECISION_CRITERIA } = require('../config/llm');
const Chat = require('../models/Chat');
const Inquiry = require('../models/Inquiry');
const { getRelevantDocuments } = require('./ragService');

// Process incoming message using LLM
const processIncomingMessage = async (jid, message) => {
  try {
    // Get chat history
    const chatHistory = await getChatHistory(jid);
    
    // Get relevant RAG documents
    const relevantDocs = await getRelevantDocuments(message);
    
    // Add user message to chat history
    await addMessageToChat(jid, 'user', message);
    
    // Prepare conversation context for LLM
    const conversationContext = prepareConversationContext(chatHistory, relevantDocs);
    
    // Get LLM response
    const response = await getLLMResponse(jid, message, conversationContext);
    
    // Add bot response to chat history
    await addMessageToChat(jid, 'bot', response.message);
    
    // Handle conversation decision
    await handleConversationDecision(jid, response.decision, response.category, message);
    
    return response.message;
  } catch (error) {
    console.error('Error processing message with LLM:', error);
    
    const fallbackResponse = "I'm having trouble processing your request right now. Please try again later or speak with a human agent.";
    await addMessageToChat(jid, 'bot', fallbackResponse);
    
    return fallbackResponse;
  }
};

const getChatHistory = async (jid, limit = 20) => {
  try {
    const chat = await Chat.findOne({ jid }).sort({ lastUpdated: -1 }).select('messages').limit(1);
    return chat ? chat.messages.slice(-limit) : [];
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

const addMessageToChat = async (jid, role, content, metadata = {}) => {
  try {
    // Find or create chat session
    let chat = await Chat.findOne({ jid, conversationStatus: { $ne: 'ended' } })
      .sort({ lastUpdated: -1 })
      .limit(1);
    
    if (!chat) {
      // Create new chat session
      chat = new Chat({
        jid,
        messages: [],
        conversationStatus: 'active'
      });
    }
    
    // Add message to chat with metadata
    chat.messages.push({
      role,
      content,
      timestamp: new Date(),
      metadata
    });
    
    // Update last updated timestamp
    chat.lastUpdated = new Date();
    
    // Save chat
    await chat.save();
    return chat;
  } catch (error) {
    console.error('Error adding message to chat:', error);
    throw error;
  }
};

const prepareConversationContext = (chatHistory, relevantDocs) => {
  const messages = chatHistory.map(msg => ({ role: msg.role === 'bot' ? 'assistant' : msg.role, content: msg.content }));
  messages.unshift({ role: 'system', content: SYSTEM_PROMPTS.default });
  if (relevantDocs.length > 0) {
    messages.unshift({ role: 'system', content: `Reference information: ${relevantDocs.map(doc => doc.content).join('\n\n')}` });
  }
  return messages;
};

const getLLMResponse = async (jid, message, conversationContext) => {
  try {
    const contextWithDecision = [
      ...conversationContext,
      { role: 'user', content: message },
      { role: 'system', content: `\nBased on this conversation, decide:\n1. Continue normally\n2. End conversation\n3. Escalate to human intervention\nCATEGORY: ["Service", "Test Drive", "Emergency", "Other"]\nFORMAT: DECISION: [continue|end|humanIntervention]\nCATEGORY: [category]\nMESSAGE: [response]` }
    ];
    
    const completion = await callGroqApi(contextWithDecision, { max_tokens: 1000, temperature: 0.7 });
    return parseLLMResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error getting LLM response:', error);
    return { decision: 'continue', category: 'none', message: "I'm having trouble processing your request." };
  }
};

const parseLLMResponse = (llmOutput) => {
  try {
    let decision = 'continue', category = 'none', message = llmOutput;
    const decisionMatch = llmOutput.match(/DECISION:\s*(continue|end|humanIntervention)/i);
    const categoryMatch = llmOutput.match(/CATEGORY:\s*(Service|Test Drive|Emergency|Other|none)/i);
    const messageMatch = llmOutput.match(/MESSAGE:\s*(.+)/is);
    if (decisionMatch) decision = decisionMatch[1].toLowerCase();
    if (categoryMatch) category = categoryMatch[1];
    if (messageMatch) message = messageMatch[1].trim();
    return { decision, category, message };
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    return { decision: 'continue', category: 'none', message: llmOutput };
  }
};

const handleConversationDecision = async (jid, decision, category, lastUserMessage) => {
  try {
    const chat = await Chat.findOne({ jid, conversationStatus: { $ne: 'ended' } }).sort({ lastUpdated: -1 }).limit(1);
    if (!chat) return;
    if (decision === 'end') {
      chat.conversationStatus = 'ended';
    } else if (decision === 'humanIntervention') {
      chat.conversationStatus = 'escalated';
      await Inquiry.create({
        jid,
        chatId: chat._id,
        category: category !== 'none' ? category : 'Other',
        status: 'open',
        priority: category === 'Emergency' ? 'urgent' : 'medium',
        summary: `User needs help with: ${lastUserMessage.substring(0, 100)}...`
      });
    }
    await chat.save();
  } catch (error) {
    console.error('Error handling conversation decision:', error);
  }
};

module.exports = { processIncomingMessage, getChatHistory, addMessageToChat };