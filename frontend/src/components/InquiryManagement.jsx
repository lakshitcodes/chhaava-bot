// frontend/src/components/InquiryManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiCheck, FiX, FiUser, FiClock } from 'react-icons/fi';
import ChatHistory from './ChatHistory';
import { API_URL } from '../config';

const InquiryManagement = ({ inquiryId, onClose }) => {
  const [inquiry, setInquiry] = useState(null);
  const [chat, setChat] = useState(null);
  const [user, setUser] = useState(null);
  const [response, setResponse] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Fetch inquiry data
  useEffect(() => {
    const fetchInquiryData = async () => {
      try {
        setLoading(true);
        
        const res = await axios.get(`${API_URL}/api/inquiries/${inquiryId}`);
        
        setInquiry(res.data.data.inquiry);
        setChat(res.data.data.chat);
        setUser(res.data.data.user);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiry data:', error);
        setLoading(false);
      }
    };
    
    if (inquiryId) {
      fetchInquiryData();
    }
  }, [inquiryId]);
  
  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      
      const res = await axios.put(`${API_URL}/api/inquiries/${inquiryId}`, {
        status: newStatus
      });
      
      setInquiry(res.data.data);
      setUpdating(false);
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      setUpdating(false);
    }
  };
  
  // Handle send response
  const handleSendResponse = async (e) => {
    e.preventDefault();
    
    if (!response.trim()) return;
    
    try {
      setUpdating(true);
      
      const res = await axios.post(`${API_URL}/api/inquiries/${inquiryId}/respond`, {
        message: response
      });
      
      // Update inquiry with new notes
      setInquiry(res.data.inquiry);
      
      // Clear response field
      setResponse('');
      
      // Refresh chat to show new message
      const chatRes = await axios.get(`${API_URL}/api/chats/${chat._id}`);
      setChat(chatRes.data.data);
      
      setUpdating(false);
    } catch (error) {
      console.error('Error sending response:', error);
      setUpdating(false);
    }
  };
  
  // Handle add note
  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    try {
      setUpdating(true);
      
      const res = await axios.put(`${API_URL}/api/inquiries/${inquiryId}`, {
        note
      });
      
      setInquiry(res.data.data);
      setNote('');
      setUpdating(false);
    } catch (error) {
      console.error('Error adding note:', error);
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Loading inquiry data...</div>;
  }
  
  if (!inquiry) {
    return <div className="error">Inquiry not found</div>;
  }
  
  return (
    <div className="inquiry-management">
      <div className="inquiry-header">
        <h2>
          {inquiry.category} - {user?.name || user?.jid || 'Unknown User'}
        </h2>
        <div className="inquiry-meta">
          <span className={`inquiry-status ${inquiry.status}`}>
            {inquiry.status}
          </span>
          <span className={`inquiry-priority ${inquiry.priority}`}>
            {inquiry.priority}
          </span>
          <span className="inquiry-date">
            <FiClock /> {new Date(inquiry.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="inquiry-grid">
        <div className="inquiry-chat card">
          <h3>Conversation</h3>
          {chat ? (
            <ChatHistory chat={chat} user={user} />
          ) : (
            <p>No chat history available</p>
          )}
          
          {inquiry.status !== 'resolved' && (
            <form className="response-form" onSubmit={handleSendResponse}>
              <textarea
                className="response-input"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response to the customer..."
                rows={3}
                disabled={updating}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!response.trim() || updating}
              >
                <FiSend /> Send Response
              </button>
            </form>
          )}
        </div>
        
        <div className="inquiry-details card">
          <h3>Inquiry Details</h3>
          
          <div className="detail-item">
            <strong>User:</strong> {user?.name || 'Unknown'}
          </div>
          <div className="detail-item">
            <strong>Phone:</strong> {user?.phone || 'Unknown'}
          </div>
          <div className="detail-item">
            <strong>JID:</strong> {inquiry.jid}
          </div>
          <div className="detail-item">
            <strong>Created:</strong> {new Date(inquiry.createdAt).toLocaleString()}
          </div>
          {inquiry.resolvedAt && (
            <div className="detail-item">
              <strong>Resolved:</strong> {new Date(inquiry.resolvedAt).toLocaleString()}
            </div>
          )}
          
          <div className="detail-item">
            <strong>Summary:</strong> {inquiry.summary}
          </div>
          
          <div className="status-actions">
            <h4>Update Status</h4>
            <div className="status-buttons">
              <button 
                className={`status-button ${inquiry.status === 'open' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('open')}
                disabled={inquiry.status === 'open' || updating}
              >
                Open
              </button>
              <button 
                className={`status-button ${inquiry.status === 'in-progress' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('in-progress')}
                disabled={inquiry.status === 'in-progress' || updating}
              >
                In Progress
              </button>
              <button 
                className={`status-button ${inquiry.status === 'resolved' ? 'active' : ''}`}
                onClick={() => handleStatusUpdate('resolved')}
                disabled={inquiry.status === 'resolved' || updating}
              >
                <FiCheck /> Resolved
              </button>
            </div>
          </div>
          
          <div className="notes-section">
            <h4>Notes</h4>
            <div className="add-note">
              <textarea
                className="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this inquiry..."
                rows={2}
                disabled={updating}
              />
              <button 
                className="add-note-button"
                onClick={handleAddNote}
                disabled={!note.trim() || updating}
              >
                Add Note
              </button>
            </div>
            
            <div className="notes-list">
              {inquiry.notes.length > 0 ? (
                inquiry.notes.slice().reverse().map((note, index) => (
                  <div key={index} className="note-item">
                    <div className="note-content">{note.content}</div>
                    <div className="note-meta">
                      <span className="note-author">
                        <FiUser /> {note.author}
                      </span>
                      <span className="note-time">
                        <FiClock /> {new Date(note.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No notes yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryManagement;