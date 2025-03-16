// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { FiUsers, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import ChatHistory from '../components/ChatHistory';
import { API_URL } from '../config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    chats: 0,
    inquiries: 0,
    openInquiries: 0
  });
  
  const [recentChats, setRecentChats] = useState([]);
  const [inquiryStats, setInquiryStats] = useState({
    byCategory: [],
    byStatus: [],
    dailyTrend: []
  });
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users count
        const usersRes = await axios.get(`${API_URL}/api/users?limit=1`);
        
        // Fetch recent chats
        const chatsRes = await axios.get(`${API_URL}/api/chats/recent?limit=5`);
        
        // Fetch inquiries stats
        const inquiryStatsRes = await axios.get(`${API_URL}/api/inquiries/stats`);
        
        // Fetch open inquiries count
        const openInquiriesRes = await axios.get(`${API_URL}/api/inquiries?status=open&limit=1`);
        
        setStats({
          users: usersRes.data.total || 0,
          chats: chatsRes.data.total || 0,
          inquiries: inquiryStatsRes.data.data.byStatus.reduce((total, item) => total + item.count, 0) || 0,
          openInquiries: openInquiriesRes.data.total || 0
        });
        
        setRecentChats(chatsRes.data.data || []);
        setInquiryStats(inquiryStatsRes.data.data || {
          byCategory: [],
          byStatus: [],
          dailyTrend: []
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };
  
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {loading ? (
        <div className="loading">Loading dashboard data...</div>
      ) : (
        <>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-icon users">
                <FiUsers />
              </div>
              <div className="stat-details">
                <h3>Total Users</h3>
                <p className="stat-value">{stats.users}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon chats">
                <FiMessageSquare />
              </div>
              <div className="stat-details">
                <h3>Active Chats</h3>
                <p className="stat-value">{stats.chats}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon inquiries">
                <FiAlertCircle />
              </div>
              <div className="stat-details">
                <h3>Open Inquiries</h3>
                <p className="stat-value">{stats.openInquiries}</p>
              </div>
            </div>
          </div>
          
          <div className="dashboard-grid">
            <div className="recent-chats card">
              <h2>Recent Conversations</h2>
              <div className="chat-list">
                {recentChats.length > 0 ? (
                  recentChats.map((item) => (
                    <div 
                      key={item.chat._id} 
                      className={`chat-item ${selectedChat === item.chat ? 'selected' : ''}`}
                      onClick={() => handleChatSelect(item.chat)}
                    >
                      <div className="chat-avatar">
                        {item.user?.name?.charAt(0) || item.user.jid.charAt(0)}
                      </div>
                      <div className="chat-details">
                        <h4>{item.user?.name || item.user.jid}</h4>
                        <p>
                          {item.chat.messages[item.chat.messages.length - 1]?.content.substring(0, 30) + '...'}
                        </p>
                        <span className="chat-time">
                          {new Date(item.chat.lastUpdated).toLocaleString()}
                        </span>
                      </div>
                      <div className={`chat-status ${item.chat.conversationStatus}`}>
                        {item.chat.conversationStatus}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No recent conversations</p>
                )}
              </div>
            </div>
            
            <div className="chat-preview card">
              <h2>Conversation Preview</h2>
              {selectedChat ? (
                <ChatHistory chat={selectedChat} />
              ) : (
                <p>Select a conversation to view</p>
              )}
            </div>
            
            <div className="inquiry-stats card">
              <h2>Inquiry Statistics</h2>
              
              <div className="stat-section">
                <h3>By Category</h3>
                <div className="stat-bars">
                  {inquiryStats.byCategory.map((item) => (
                    <div key={item._id} className="stat-bar">
                      <div className="stat-label">{item._id}</div>
                      <div className="stat-bar-outer">
                        <div 
                          className="stat-bar-inner" 
                          style={{ 
                            width: `${Math.min(100, (item.count / stats.inquiries) * 100)}%`,
                            backgroundColor: 
                              item._id === 'Roadside Emergency' ? '#ff4d4d' :
                              item._id === 'Service Appointment Issue' ? '#4d94ff' :
                              item._id === 'Test Drive Inquiry' ? '#47d147' : '#f7b924'
                          }}
                        ></div>
                      </div>
                      <div className="stat-value">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="stat-section">
                <h3>By Status</h3>
                <div className="stat-donut">
                  {/* Simple visualization - in a real app, use a chart library */}
                  <div className="stat-status-circles">
                    {inquiryStats.byStatus.map((item) => (
                      <div key={item._id} className={`status-circle ${item._id}`}>
                        <span className="status-count">{item.count}</span>
                        <span className="status-label">{item._id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;