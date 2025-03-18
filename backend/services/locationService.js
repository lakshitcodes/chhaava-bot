// backend/services/locationService.js
const { groq, SYSTEM_PROMPTS } = require('../config/llm');
const { addMessageToChat } = require('./llmService');

// Process location messages
const processLocationMessage = async (jid, location) => {
  try {
    // Format location data for clarity
    const locationText = `Location coordinates: Latitude ${location.latitude}, Longitude ${location.longitude}${location.name ? `, Name: ${location.name}` : ''}${location.address ? `, Address: ${location.address}` : ''}`;
    
    // Add user's location message to chat history
    await addMessageToChat(jid, 'user', `Shared a location: ${locationText}`);
    
    // Prepare the location-specific prompt
    const locationPrompt = `
      The user has shared their location with the following coordinates:
      Latitude: ${location.latitude}
      Longitude: ${location.longitude}
      ${location.name ? `Location name: ${location.name}` : ''}
      ${location.address ? `Address: ${location.address}` : ''}
      
      Based on this location information, please determine which of the following services they might need:
      1. Service Appointment Booking - If they appear to be at or near a dealership and might need service
      2. Test Drive Scheduling - If they appear to be at a dealership and might want to test drive a vehicle
      3. Roadside Emergency Assistance - If they appear to be on a highway, remote location, or parking lot (not at a dealership)
      
      Please provide a helpful response offering the appropriate service based on the location context.
      If you can't determine which service they need from location alone, ask them what assistance they require.
      
      Format your response as follows:
      SERVICE_TYPE: [ServiceAppointment|TestDrive|RoadsideAssistance|Unknown]
      MESSAGE: [your helpful response to the user]
    `;
    
    // Call LLM to analyze the location
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.default },
        { role: 'system', content: locationPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    // Extract the response
    const response = completion.choices[0].message.content;
    
    // Parse service type and message
    let serviceType = 'Unknown';
    let message = response;
    
    const serviceTypeMatch = response.match(/SERVICE_TYPE:\s*(ServiceAppointment|TestDrive|RoadsideAssistance|Unknown)/i);
    const messageMatch = response.match(/MESSAGE:\s*(.+)(?:\n|$)/is);
    
    if (serviceTypeMatch) serviceType = serviceTypeMatch[1];
    if (messageMatch) message = messageMatch[1].trim();
    
    // Add metadata to identify this is a location-based response
    const metadata = {
      type: 'location_response',
      serviceType,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    };
    
    // Add bot response to chat history with metadata
    await addMessageToChat(jid, 'bot', message, metadata);
    
    return message;
  } catch (error) {
    console.error('Error processing location message:', error);
    
    // Fallback response
    const fallbackResponse = "I received your location, but I'm having trouble processing it right now. Could you please tell me what kind of assistance you need?";
    
    // Add fallback response to chat history
    await addMessageToChat(jid, 'bot', fallbackResponse);
    
    return fallbackResponse;
  }
};

module.exports = {
  processLocationMessage
};