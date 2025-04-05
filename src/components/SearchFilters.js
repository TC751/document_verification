import React from 'react';
import '../styles/SearchFilters.css';

const SearchFilters = ({ onSearch, onFilter }) => {
  return (
    <div className="search-filters">
      <input
        type="text"
        className="search-input"
        placeholder="Search by metadata or owner..."
        onChange={(e) => onSearch(e.target.value)}
      />
      
      <select 
        className="filter-select"
        onChange={(e) => onFilter('status', e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="0">Pending</option>
        <option value="1">Verified</option>
        <option value="2">Rejected</option>
        <option value="3">Expired</option>
      </select>

      <select 
        className="filter-select"
        onChange={(e) => onFilter('date', e.target.value)}
      >
        <option value="">All Time</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </div>
  );
};

export default SearchFilters;