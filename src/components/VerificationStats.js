import React from 'react';

const VerificationStats = ({ stats }) => {
  return (
    <div className="verification-stats">
      <div className="stat-card">
        <h4>Pending</h4>
        <div className="stat-value pending">{stats.pending}</div>
      </div>
      <div className="stat-card">
        <h4>Verified</h4>
        <div className="stat-value verified">{stats.verified}</div>
      </div>
      <div className="stat-card">
        <h4>Rejected</h4>
        <div className="stat-value rejected">{stats.rejected}</div>
      </div>
      <div className="stat-card">
        <h4>Total</h4>
        <div className="stat-value total">{stats.total}</div>
      </div>
    </div>
  );
};

export default VerificationStats;