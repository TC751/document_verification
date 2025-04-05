import React, { useState, useEffect } from 'react';
import '../styles/components.css';

const Dashboard = ({ contract }) => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    rejectedDocuments: 0
  });

  useEffect(() => {
    if (contract) {
      loadStats();
    }
  }, [contract]);

  const loadStats = async () => {
    try {
      const [total, pending, verified, rejected] = await Promise.all([
        contract.methods.getTotalDocuments().call(),
        contract.methods.getPendingDocuments().call(),
        contract.methods.getVerifiedDocuments().call(),
        contract.methods.getRejectedDocuments().call()
      ]);

      setStats({
        totalDocuments: parseInt(total),
        pendingDocuments: parseInt(pending),
        verifiedDocuments: parseInt(verified),
        rejectedDocuments: parseInt(rejected)
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <h2 className="section-title">Dashboard Overview</h2>
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Documents</h3>
          <p>{stats.totalDocuments}</p>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p>{stats.pendingDocuments}</p>
        </div>
        <div className="stat-card verified">
          <h3>Verified</h3>
          <p>{stats.verifiedDocuments}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p>{stats.rejectedDocuments}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

