// frontend/src/pages/Inquiries.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFilter, FiRefreshCw, FiX } from 'react-icons/fi';
import InquiryManagement from '../components/InquiryManagement';
import { API_URL } from '../config';

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch inquiries
  const fetchInquiries = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      
      const res = await axios.get(`${API_URL}/api/inquiries?${params.toString()}`);
      
      setInquiries(res.data.data || []);
      setTotalPages(res.data.pages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setLoading(false);
    }
  };
  
  // Initial fetch and when filters/page change
  useEffect(() => {
    fetchInquiries();
  }, [filters, page]);
  
  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
    setPage(1); // Reset to first page on filter change
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: ''
    });
    setPage(1);
  };
  
  // Handle inquiry selection
  const handleInquirySelect = (inquiry) => {
    setSelectedInquiry(inquiry._id);
  };
  
  // Close inquiry details
  const closeInquiryDetails = () => {
    setSelectedInquiry(null);
    fetchInquiries(); // Refresh list after closing
  };
  
  return (
    <div className="inquiries-page">
      <div className="page-header">
        <h1>Customer Inquiries</h1>
        <div className="header-actions">
          <button className="refresh-button" onClick={fetchInquiries}>
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>
      
      <div className="filters-bar">
        <div className="filter-group">
          <label>Status</label>
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={filters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Service Appointment Issue">Service Appointment Issue</option>
            <option value="Test Drive Inquiry">Test Drive Inquiry</option>
            <option value="Roadside Emergency">Roadside Emergency</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Priority</label>
          <select 
            value={filters.priority} 
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        
        {(filters.status || filters.category || filters.priority) && (
          <button className="clear-filters" onClick={clearFilters}>
            <FiX /> Clear Filters
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="loading">Loading inquiries...</div>
      ) : selectedInquiry ? (
        <InquiryManagement 
          inquiryId={selectedInquiry} 
          onClose={closeInquiryDetails}
        />
      ) : (
        <>
          <div className="inquiries-list">
            <table className="inquiries-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Category</th>
                  <th>Summary</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <tr 
                      key={inquiry._id}
                      className="inquiry-row"
                      onClick={() => handleInquirySelect(inquiry)}
                    >
                      <td>{inquiry.user?.name || inquiry.jid}</td>
                      <td>
                        <span className={`category-badge ${inquiry.category.replace(/\s+/g, '-').toLowerCase()}`}>
                          {inquiry.category}
                        </span>
                      </td>
                      <td className="summary-cell">{inquiry.summary}</td>
                      <td>
                        <span className={`status-badge ${inquiry.status}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td>
                        <span className={`priority-badge ${inquiry.priority}`}>
                          {inquiry.priority}
                        </span>
                      </td>
                      <td>
                        {new Date(inquiry.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No inquiries found matching current filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
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
        </>
      )}
    </div>
  );
};

export default Inquiries;