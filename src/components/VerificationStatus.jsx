import React from 'react';

const VerificationStatus = ({ stats }) => {
    return (
        <div className="verification-status">
            <h3>Verification Statistics</h3>
            <div className="stats-grid">
                <div className="stat-item">
                    <h4>Total Documents</h4>
                    <span className="stat-value">{stats.total}</span>
                </div>
                <div className="stat-item">
                    <h4>Pending</h4>
                    <span className="stat-value pending">{stats.pending}</span>
                </div>
                <div className="stat-item">
                    <h4>Verified</h4>
                    <span className="stat-value verified">{stats.verified}</span>
                </div>
                <div className="stat-item">
                    <h4>Rejected</h4>
                    <span className="stat-value rejected">{stats.rejected}</span>
                </div>
            </div>
        </div>
    );
};

export default VerificationStatus;