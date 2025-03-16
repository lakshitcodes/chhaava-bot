// backend/services/llmService.js
const { callGrokApi, SYSTEM_PROMPTS, DECISION_CRITERIA } = require('../config/llm');
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
    
    // Return fallback response
    const fallbackResponse = "I'm having trouble processing your request right now. Please try again in a moment or ask to speak with a human agent if this continues.";
    await addMessageToChat(jid, 'bot', fallbackResponse);
    
    return fallbackResponse;
  }
};

// Get chat history for a JID
const getChatHistory = async (jid, limit = 20) => {
  try {
    // Find most recent chat session
    const chat = await Chat.findOne({ jid })
      .sort({ lastUpdated: -1 })
      .select('messages')
      .limit(1);
    
    if (!chat) {
      return [];
    }
    
    // Return last X messages in chronological order
    return chat.messages.slice(-limit);
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};

// Add a message to chat history
const addMessageToChat = async (jid, role, content) => {
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
    
    // Add message to chat
    chat.messages.push({
      role,
      content,
      timestamp: new Date()
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

// Prepare conversation context for LLM
const prepareConversationContext = (chatHistory, relevantDocs) => {
  // Convert chat history to LLM format
  const messages = chatHistory.map(msg => ({
    role: msg.role === 'bot' ? 'assistant' : msg.role,
    content: msg.content
  }));
  
  // Add system prompt
  messages.unshift({
    role: 'system',
    content: SYSTEM_PROMPTS.default
  });
  
  // Add relevant documents if available
  if (relevantDocs && relevantDocs.length > 0) {
    const docContent = relevantDocs.map(doc => doc.content).join('\n\n');
    messages.unshift({
      role: 'system',
      content: `Reference information: ${docContent}`
    });
  }
  
  return messages;
};

// Get response from LLM
const getLLMResponse = async (jid, message, conversationContext) => {
  try {
    // Add decision-making prompt to context
    const contextWithDecision = [
      ...conversationContext,
      {
        role: 'user',
        content: message
      },
      {
        role: 'system',
        content: `
        Based on this conversation, decide if you should:
        1. Continue the conversation normally
        2. End the conversation as the request is resolved
        3. Escalate to human intervention
        
        If human intervention is needed, categorize as one of:
        - "Service Appointment Issue"
        - "Test Drive Inquiry"
        - "Roadside Emergency"
        - "Other"
        
        Format your response as follows:
        DECISION: [continue|end|humanIntervention]
        CATEGORY: [category if humanIntervention, otherwise "none"]
        MESSAGE: [your response to the user]
        `
      }
    ];
    
    // Call Grok LLM
    const completion = await callGrokApi(contextWithDecision, {
      max_tokens: 1000,
      temperature: 0.7
    });
    
    // Parse response
    const llmOutput = completion.choices[0].message.content;
    const parsed = parseLLMResponse(llmOutput);
    
    return parsed;
  } catch (error) {
    console.error('Error getting LLM response:', error);
    // Return default response
    return {
      decision: 'continue',
      category: 'none',
      message: "I'm having trouble processing your request. How else can I help you?"
    };
  }
};

// Parse LLM response to extract decision, category, and message
const parseLLMResponse = (llmOutput) => {
  try {
    // Default values
    let decision = 'continue';
    let category = 'none';
    let message = llmOutput;
    
    // Try to extract structured format
    const decisionMatch = llmOutput.match(/DECISION:\s*(continue|end|humanIntervention)/i);
    const categoryMatch = llmOutput.match(/CATEGORY:\s*(Service Appointment Issue|Test Drive Inquiry|Roadside Emergency|Other|none)/i);
    const messageMatch = llmOutput.match(/MESSAGE:\s*(.+)(?:\n|$)/is);
    
    if (decisionMatch) decision = decisionMatch[1].toLowerCase();
    if (categoryMatch) category = categoryMatch[1];
    if (messageMatch) message = messageMatch[1].trim();
    
    return { decision, category, message };
  } catch (error) {
    console.error('Error parsing LLM response:', error);
    // Return defaults
    return {
      decision: 'continue',
      category: 'none',
      message: llmOutput
    };
  }
};

// Handle conversation decision
const handleConversationDecision = async (jid, decision, category, lastUserMessage) => {
  try {
    // Get the current chat
    const chat = await Chat.findOne({ jid, conversationStatus: { $ne: 'ended' } })
      .sort({ lastUpdated: -1 })
      .limit(1);
    
    if (!chat) return;
    
    if (decision === 'end') {
      // End the conversation
      chat.conversationStatus = 'ended';
      await chat.save();
      
    } else if (decision === 'humanIntervention') {
      // Escalate to human intervention
      chat.conversationStatus = 'escalated';
      await chat.save();
      
      // Create inquiry
      const inquiry = new Inquiry({
        jid,
        chatId: chat._id,
        category: category !== 'none' ? category : 'Other',
        status: 'open',
        priority: category === 'Roadside Emergency' ? 'urgent' : 'medium',
        summary: `Customer needs help with: ${lastUserMessage.substring(0, 100)}...`
      });
      
      await inquiry.save();
    }
    
    // For 'continue', no action needed
    
  } catch (error) {
    console.error('Error handling conversation decision:', error);
  }
};

module.exports = {
  processIncomingMessage,
  getChatHistory,
  addMessageToChat
};