import React from 'react';
import '../styles/AccountSwitcher.css';

const AccountSwitcher = ({ 
  account, 
  availableAccounts, 
  isChecker, 
  onSwitchAccount 
}) => {
  return (
    <div className="account-switcher">
      <label htmlFor="account-select">Switch Account:</label>
      <select 
        id="account-select"
        value={account || ''} 
        onChange={(e) => onSwitchAccount(e.target.value)}
        className="account-selector"
      >
        <option value="">Select Account</option>
        {availableAccounts.map((acc) => (
          <option key={acc} value={acc}>
            {acc.substring(0, 6)}...{acc.substring(38)} 
            {isChecker && acc === account ? ' (Checker)' : ' (User)'}
          </option>
        ))}
      </select>
      <div className="account-status">
        <div className="account-info">
          {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Not Connected'}
        </div>
        {isChecker && <span className="checker-badge">Checker</span>}
      </div>
    </div>
  );
};

export default AccountSwitcher;