// frontend/src/components/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiPlus, FiCheck, FiX, FiUsers, FiMessageSquare, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { API_URL } from '../config';

const UserManagement = () => {
  const [newUser, setNewUser] = useState({
    jid: '',
    name: '',
    isGroup: false,
    isActive: true  // Added isActive field
  });
  
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastFilter, setBroadcastFilter] = useState({
    isGroup: false,
    isActive: true,  // Only broadcast to active JIDs by default
    tags: []
  });
  
  const [activeJids, setActiveJids] = useState([]);
  const [selectedJids, setSelectedJids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  
  // Fetch active JIDs for broadcasting
  useEffect(() => {
    const fetchActiveJids = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/users/active-jids`);
        setActiveJids(res.data.data || []);
      } catch (error) {
        console.error('Error fetching active JIDs:', error);
      }
    };
    
    fetchActiveJids();
  }, []);
  
  // Handle new user change
  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUser({
      ...newUser,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Validate JID format
    if (!newUser.jid.includes('@')) {
      setError('Invalid JID format. Include the full JID with @s.whatsapp.net or @g.us');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Make API call to create user
      const res = await axios.post(`${API_URL}/api/users`, newUser);
      
      // Reset form on success
      setNewUser({
        jid: '',
        name: '',
        isGroup: false,
        isActive: true
      });
      
      setSuccess(`User ${res.data.data.jid} added successfully!`);
      setLoading(false);
      
      // If new user is active, refresh the active JIDs list
      if (newUser.isActive) {
        const activeRes = await axios.get(`${API_URL}/api/users/active-jids`);
        setActiveJids(activeRes.data.data || []);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error adding user');
      setLoading(false);
    }
  };
  
  // Handle broadcast message submission
  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    if (!broadcastMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }
    
    try {
      setBroadcastLoading(true);
      setError('');
      setSuccess('');
      
      // Prepare payload
      const payload = {
        message: broadcastMessage
      };
      
      // If JIDs are specifically selected
      if (selectedJids.length > 0) {
        payload.jids = selectedJids;
      } 
      // Otherwise use filter
      else {
        payload.filter = broadcastFilter;
      }
      
      // Make API call to send broadcast
      const res = await axios.post(`${API_URL}/api/users/broadcast`, payload);
      
      // Reset form on success
      setBroadcastMessage('');
      setSelectedJids([]);
      
      setSuccess(`Broadcast sent to ${res.data.results.filter(r => r.success).length} recipients!`);
      setBroadcastLoading(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Error sending broadcast');
      setBroadcastLoading(false);
    }
  };
  
  return (
    <div className="user-management">
      {/* Success message */}
      {success && (
        <div className="success-message">
          <FiCheck /> {success}
          <button className="close-button" onClick={() => setSuccess('')}>
            <FiX />
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="error-message">
          <FiX /> {error}
          <button className="close-button" onClick={() => setError('')}>
            <FiX />
          </button>
        </div>
      )}
      
      <div className="user-management-grid">
        {/* Add new user form */}
        <div className="add-user-form card">
          <h2>Add New User/Group</h2>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label htmlFor="jid">WhatsApp JID</label>
              <input
                type="text"
                id="jid"
                name="jid"
                value={newUser.jid}
                onChange={handleNewUserChange}
                placeholder="e.g. 1234567890@s.whatsapp.net"
                required
                disabled={loading}
              />
              <small>
                For individual users: phone@s.whatsapp.net<br />
                For groups: group-id@g.us
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Display Name (Optional)</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleNewUserChange}
                placeholder="Display name"
                disabled={loading}
              />
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isGroup"
                name="isGroup"
                checked={newUser.isGroup}
                onChange={handleNewUserChange}
                disabled={loading}
              />
              <label htmlFor="isGroup">This is a group</label>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={newUser.isActive}
                onChange={handleNewUserChange}
                disabled={loading}
              />
              <label htmlFor="isActive">Enable bot to respond to this JID</label>
              <small>
                If checked, the bot will automatically respond to messages from this user/group.
                {newUser.isGroup && " For groups, the bot will only respond when explicitly mentioned or replied to."}
              </small>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !newUser.jid}
            >
              <FiPlus /> Add User
            </button>
          </form>
        </div>
        
        {/* Broadcast message form */}
        <div className="broadcast-form card">
          <h2>Send Broadcast Message</h2>
          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label htmlFor="broadcastMessage">Message</label>
              <textarea
                id="broadcastMessage"
                name="broadcastMessage"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Type your broadcast message here..."
                rows={4}
                required
                disabled={broadcastLoading}
              />
            </div>
            
            <div className="broadcast-filters">
              <h3>Recipients</h3>
              
              <div className="form-group">
                <label>Send to</label>
                <div className="radio-group">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="allActiveUsers"
                      name="recipientType"
                      checked={selectedJids.length === 0}
                      onChange={() => setSelectedJids([])}
                      disabled={broadcastLoading}
                    />
                    <label htmlFor="allActiveUsers">All bot-enabled users ({activeJids.length})</label>
                  </div>
                  
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="specificUsers"
                      name="recipientType"
                      checked={selectedJids.length > 0}
                      onChange={() => setSelectedJids(activeJids.map(item => item.jid))}
                      disabled={broadcastLoading}
                    />
                    <label htmlFor="specificUsers">Select specific users/groups</label>
                  </div>
                </div>
              </div>
              
              {selectedJids.length > 0 && (
                <div className="form-group">
                  <label htmlFor="selectedJidsSelect">Select Recipients</label>
                  <select
                    id="selectedJidsSelect"
                    multiple
                    size={Math.min(10, activeJids.length)}
                    value={selectedJids}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedJids(selected);
                    }}
                    disabled={broadcastLoading}
                    className="jid-select"
                  >
                    {activeJids.map(item => (
                      <option key={item.jid} value={item.jid}>
                        {item.name} ({item.isGroup ? 'Group' : 'User'})
                      </option>
                    ))}
                  </select>
                  <small>
                    Hold Ctrl (or Cmd on Mac) to select multiple recipients.
                    <br />
                    Selected recipients: {selectedJids.length}
                  </small>
                </div>
              )}
              
              {selectedJids.length === 0 && (
                <div className="filter-options">
                  <div className="form-group checkbox">
                    <input
                      type="checkbox"
                      id="includeGroups"
                      name="includeGroups"
                      checked={broadcastFilter.isGroup}
                      onChange={(e) => setBroadcastFilter({
                        ...broadcastFilter,
                        isGroup: e.target.checked
                      })}
                      disabled={broadcastLoading}
                    />
                    <label htmlFor="includeGroups">Include groups</label>
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={broadcastLoading || !broadcastMessage.trim() || (selectedJids.length === 0 && activeJids.length === 0)}
            >
              {broadcastLoading ? (
                "Sending..."
              ) : (
                <>
                  <FiSend /> Send Broadcast
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;