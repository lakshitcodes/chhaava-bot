// backend/config/llm.js
const axios = require('axios');

// Initialize Grok client configuration
const grokApiKey = process.env.GROK_API_KEY;
const grokApiUrl = process.env.GROK_API_URL || 'https://api.grok.ai/v1';

// Helper function to call Grok API
const callGrokApi = async (messages, options = {}) => {
  try {
    const response = await axios.post(
      `${grokApiUrl}/chat/completions`,
      {
        messages,
        model: process.env.GROK_MODEL || 'grok-2', // Use your specific Grok model
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error calling Grok API:', error.response?.data || error.message);
    throw error;
  }
};

// System prompts for different scenarios
const SYSTEM_PROMPTS = {
  default: `You are a helpful assistant for a car dealership. 
  Provide concise, accurate information about our vehicles, services, and policies. 
  Be friendly and professional. If you're unsure about something, offer to connect the customer with a human agent.`,
  
  serviceAppointment: `You are assisting with service appointments for our dealership.
  Help customers schedule, modify, or cancel service appointments. 
  If their request is complex or requires checking specific availability, suggest human intervention.`,
  
  testDrive: `You are helping customers book test drives for vehicles.
  Answer questions about vehicle availability and the test drive process.
  For specific booking requests, gather key information like preferred date/time, vehicle model, and customer details.`,
  
  emergencyAssistance: `You are providing emergency roadside assistance information.
  For urgent situations, immediately offer to connect the customer with our emergency roadside team.
  Collect their location and the nature of their emergency.`
};

// Decision criteria for LLM
const DECISION_CRITERIA = {
  continue: `The conversation can be handled by the bot and should continue normally.`,
  end: `The customer's request has been fully resolved and the conversation can end.`,
  humanIntervention: `The request is complex, sensitive, or requires human expertise/verification. The conversation should be escalated to a human agent.`
};

module.exports = {
  callGrokApi,
  SYSTEM_PROMPTS,
  DECISION_CRITERIA
};