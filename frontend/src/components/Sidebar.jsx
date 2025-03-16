// frontend/src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>WhatsApp Admin</h2>
      </div>
      <nav className="nav">
        <ul>
          <li className={isActive('/')}>
            <Link to="/">
              <FiHome />
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive('/users')}>
            <Link to="/users">
              <FiUsers />
              <span>Users</span>
            </Link>
          </li>
          <li className={isActive('/inquiries')}>
            <Link to="/inquiries">
              <FiAlertCircle />
              <span>Inquiries</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>© 2025 WhatsApp Chatbot</p>
      </div>
    </div>
  );
};

export default Sidebar;