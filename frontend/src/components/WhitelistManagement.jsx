// frontend/src/components/WhitelistManagement.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiPlus, FiCheck, FiX, FiUsers, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { API_URL } from '../config';

const WhitelistManagement = () => {
  const [newJid, setNewJid] = useState('');
  const [name, setName] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [whitelistedUsers, setWhitelistedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Fetch whitelist - SIMPLIFIED API ENDPOINT
  const fetchWhitelist = async () => {
    try {
      setLoading(true);
      console.log("Fetching whitelist...");
      
      // Simplified endpoint
      const res = await axios.get(`${API_URL}/api/whitelist`);
      console.log("Whitelist response:", res.data);
      setWhitelistedUsers(res.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching whitelist:', error);
      setError('Failed to load whitelist. Please try again.');
      setLoading(false);
    }
  };
  
  // Load whitelist on component mount
  useEffect(() => {
    fetchWhitelist();
  }, []);
  
  // Handle adding JID to whitelist - SIMPLIFIED API ENDPOINT
  const handleAddToWhitelist = async (e) => {
    e.preventDefault();
    
    // Validate JID format
    if (!newJid.includes('@')) {
      setError('Invalid JID format. Must include @ symbol (e.g., 1234567890@s.whatsapp.net or group-id@g.us)');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log("Adding to whitelist:", {
        jid: newJid,
        name: name || '',
        isGroup: isGroup
      });
      
      // Simplified endpoint
      const res = await axios.post(`${API_URL}/api/whitelist`, {
        jid: newJid,
        name: name || '',
        isGroup: isGroup
      });
      
      console.log("Add to whitelist response:", res.data);
      
      // Reset form on success
      setNewJid('');
      setName('');
      setIsGroup(false);
      
      setSuccess(`JID ${res.data.data.jid} added to whitelist successfully!`);
      setLoading(false);
      
      // Refresh whitelist
      fetchWhitelist();
    } catch (error) {
      console.error('Error adding JID to whitelist:', error);
      setError(error.response?.data?.error || 'Error adding JID to whitelist');
      setLoading(false);
    }
  };
  
  // Handle removing JID from whitelist - SIMPLIFIED API ENDPOINT
  const handleRemoveFromWhitelist = async (jid) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log("Removing from whitelist:", jid);
      
      // Simplified endpoint
      await axios.delete(`${API_URL}/api/whitelist/${jid}`);
      
      setSuccess(`JID ${jid} removed from whitelist successfully!`);
      setLoading(false);
      
      // Refresh whitelist
      fetchWhitelist();
    } catch (error) {
      console.error('Error removing JID from whitelist:', error);
      setError(error.response?.data?.error || 'Error removing JID from whitelist');
      setLoading(false);
    }
  };
  
  return (
    <div className="whitelist-management">
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
      
      <div className="whitelist-grid">
        {/* Add JID to whitelist form */}
        <div className="add-jid-form card">
          <h2>Add JID to Whitelist</h2>
          <form onSubmit={handleAddToWhitelist}>
            <div className="form-group">
              <label htmlFor="jid">WhatsApp JID</label>
              <input
                type="text"
                id="jid"
                name="jid"
                value={newJid}
                onChange={(e) => setNewJid(e.target.value)}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name"
                disabled={loading}
              />
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="isGroup"
                name="isGroup"
                checked={isGroup}
                onChange={(e) => setIsGroup(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="isGroup">This is a group</label>
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !newJid}
            >
              <FiPlus /> Add to Whitelist
            </button>
          </form>
        </div>
        
        {/* Whitelist display */}
        <div className="whitelist-display card">
          <div className="card-header">
            <h2>Whitelisted JIDs {whitelistedUsers.length > 0 && `(${whitelistedUsers.length})`}</h2>
            <button 
              className="refresh-button" 
              onClick={fetchWhitelist}
              disabled={loading}
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Loading whitelist...</div>
          ) : whitelistedUsers.length > 0 ? (
            <table className="whitelist-table">
              <thead>
                <tr>
                  <th>JID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {whitelistedUsers.map((user) => (
                  <tr key={user.jid}>
                    <td className="jid-cell">{user.jid}</td>
                    <td>{user.name || '-'}</td>
                    <td>
                      <span className={`type-badge ${user.isGroup ? 'group' : 'individual'}`}>
                        {user.isGroup ? 'Group' : 'Individual'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-button remove"
                        onClick={() => handleRemoveFromWhitelist(user.jid)}
                        disabled={loading}
                      >
                        <FiTrash2 /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-whitelist">
              No JIDs in whitelist. Add JIDs to enable bot responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhitelistManagement;