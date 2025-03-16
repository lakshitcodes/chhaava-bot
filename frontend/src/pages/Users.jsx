// frontend/src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiRefreshCw, FiMessageSquare, FiEdit2, FiUser, FiUsers } from 'react-icons/fi';
import UserManagement from '../components/UserManagement';
import ChatHistory from '../components/ChatHistory';
import { API_URL } from '../config';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [userType, setUserType] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatHistory, setChatHistory] = useState(null);
  const [viewingManagement, setViewingManagement] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sendMessageModal, setSendMessageModal] = useState({
    show: false,
    jid: null,
    message: ''
  });
  
  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 15);
      
      if (search) params.append('search', search);
      if (userType) params.append('isGroup', userType === 'groups');
      
      const res = await axios.get(`${API_URL}/api/users?${params.toString()}`);
      
      setUsers(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };
  
  // Initial fetch and when filters/page change
  useEffect(() => {
    fetchUsers();
  }, [page, userType]);
  
  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on search
    fetchUsers();
  };
  
  // Handle user selection
  const handleUserSelect = async (user) => {
    try {
      setSelectedUser(user);
      setChatHistory(null);
      
      // Fetch chat history for selected user
      const res = await axios.get(`${API_URL}/api/chats/user/${user.jid}`);
      
      if (res.data.data.length > 0) {
        setChatHistory(res.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  
  // Open send message modal
  const openSendMessageModal = (jid) => {
    setSendMessageModal({
      show: true,
      jid,
      message: ''
    });
  };
  
  // Send message to user
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!sendMessageModal.message.trim()) return;
    
    try {
      await axios.post(`${API_URL}/api/users/${sendMessageModal.jid}/message`, {
        message: sendMessageModal.message
      });
      
      // Close modal and clear message
      setSendMessageModal({
        show: false,
        jid: null,
        message: ''
      });
      
      // If the user with this JID is selected, refresh chat history
      if (selectedUser && selectedUser.jid === sendMessageModal.jid) {
        const res = await axios.get(`${API_URL}/api/chats/user/${sendMessageModal.jid}`);
        
        if (res.data.data.length > 0) {
          setChatHistory(res.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  return (
    <div className="users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <div className="header-actions">
          <button 
            className={`view-toggle ${!viewingManagement ? 'active' : ''}`}
            onClick={() => setViewingManagement(false)}
          >
            <FiUsers /> User List
          </button>
          <button 
            className={`view-toggle ${viewingManagement ? 'active' : ''}`}
            onClick={() => setViewingManagement(true)}
          >
            <FiEdit2 /> Manage Users
          </button>
        </div>
      </div>
      
      {viewingManagement ? (
        <UserManagement onUserAdded={fetchUsers} />
      ) : (
        <>
          <div className="filters-bar">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-group">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, or JID..."
                />
                <button type="submit" className="search-button">
                  <FiSearch />
                </button>
              </div>
            </form>
            
            <div className="filter-group">
              <label>User Type</label>
              <select 
                value={userType} 
                onChange={(e) => {
                  setUserType(e.target.value);
                  setPage(1); // Reset to first page on filter change
                }}
              >
                <option value="">All Users</option>
                <option value="individuals">Individuals</option>
                <option value="groups">Groups</option>
              </select>
            </div>
            
            <button className="refresh-button" onClick={fetchUsers}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
          
          <div className="users-content">
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <div className="users-grid">
                <div className="users-list card">
                  <h2>Users {users.length > 0 && `(${users.length})`}</h2>
                  
                  {users.length > 0 ? (
                    <table className="users-table">
                      <thead>
                        <tr>
                          <th>Name/Phone</th>
                          <th>Type</th>
                          <th>Last Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr
                            key={user.jid}
                            className={`user-row ${selectedUser?.jid === user.jid ? 'selected' : ''}`}
                            onClick={() => handleUserSelect(user)}
                          >
                            <td>
                              <div className="user-info">
                                <div className="user-avatar">
                                  {user.isGroup ? <FiUsers /> : <FiUser />}
                                </div>
                                <div className="user-details">
                                  <div className="user-name">{user.name || 'Unnamed'}</div>
                                  <div className="user-phone">{user.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`type-badge ${user.isGroup ? 'group' : 'individual'}`}>
                                {user.isGroup ? 'Group' : 'Individual'}
                              </span>
                            </td>
                            <td>
                              {new Date(user.lastInteraction).toLocaleString()}
                            </td>
                            <td>
                              <button 
                                className="action-button message"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openSendMessageModal(user.jid);
                                }}
                              >
                                <FiMessageSquare /> Message
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-results">
                      No users found matching your criteria
                    </div>
                  )}
                  
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button 
                        className="pagination-button"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </button>
                      
                      <span className="page-info">
                        Page {page} of {totalPages}
                      </span>
                      
                      <button 
                        className="pagination-button"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="chat-history-container card">
                  <h2>
                    Chat History
                    {selectedUser && ` - ${selectedUser.name || selectedUser.phone || selectedUser.jid}`}
                  </h2>
                  
                  {selectedUser ? (
                    chatHistory ? (
                      <ChatHistory chat={chatHistory} user={selectedUser} />
                    ) : (
                      <div className="no-chat-history">
                        No chat history available for this user
                      </div>
                    )
                  ) : (
                    <div className="select-user-prompt">
                      Select a user to view chat history
                    </div>
                  )}
                  
                  {selectedUser && (
                    <button 
                      className="send-message-button"
                      onClick={() => openSendMessageModal(selectedUser.jid)}
                    >
                      <FiMessageSquare /> Send Message
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Send message modal */}
          {sendMessageModal.show && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Send Message</h3>
                  <button 
                    className="close-button"
                    onClick={() => setSendMessageModal({ show: false, jid: null, message: '' })}
                  >
                    &times;
                  </button>
                </div>
                <form className="modal-body" onSubmit={sendMessage}>
                  <div className="form-group">
                    <label>Recipient</label>
                    <div className="recipient">
                      {users.find(u => u.jid === sendMessageModal.jid)?.name || sendMessageModal.jid}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      value={sendMessageModal.message}
                      onChange={(e) => setSendMessageModal({ 
                        ...sendMessageModal, 
                        message: e.target.value 
                      })}
                      placeholder="Type your message..."
                      rows={4}
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="cancel-button"
                      onClick={() => setSendMessageModal({ show: false, jid: null, message: '' })}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="send-button"
                      disabled={!sendMessageModal.message.trim()}
                    >
                      <FiMessageSquare /> Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Users;