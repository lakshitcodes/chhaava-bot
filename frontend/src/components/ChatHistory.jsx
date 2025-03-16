// frontend/src/components/ChatHistory.jsx
import React from 'react';

const ChatHistory = ({ chat, user }) => {
  if (!chat) {
    return <div className="empty-chat">Select a chat to view history</div>;
  }
  
  return (
    <div className="chat-history">
      <div className="chat-messages">
        {chat.messages.map((message, index) => (
          <div 
            key={index} 
            className={`chat-message ${message.role === 'user' ? 'user' : 'bot'}`}
          >
            <div className="message-bubble">
              {message.content}
              
              {message.metadata && message.metadata.fromAdmin && (
                <div className="admin-badge">Admin</div>
              )}
            </div>
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      
      {chat.conversationStatus === 'escalated' && (
        <div className="escalation-notice">
          This conversation has been escalated and requires human intervention
        </div>
      )}
      
      {chat.conversationStatus === 'ended' && (
        <div className="ended-notice">
          This conversation has been marked as resolved
        </div>
      )}
    </div>
  );
};

export default ChatHistory;