import React from 'react';
import SubmitDocument from './SubmitDocument';
import DocumentList from './DocumentList';
import CheckerDashboard from './CheckerDashboard';
import AccountSwitcher from './AccountSwitcher';

const DocumentManagement = ({ 
  contract, 
  account, 
  isChecker, 
  availableAccounts, 
  onSwitchAccount 
}) => {
  if (!contract || !account) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div className="document-management">
      <AccountSwitcher
        account={account}
        availableAccounts={availableAccounts}
        isChecker={isChecker}
        onSwitchAccount={onSwitchAccount}
      />

      {!isChecker && (
        <div className="creator-dashboard">
          <h2>Document Submission</h2>
          <SubmitDocument contract={contract} account={account} />
          <h2>My Documents</h2>
          <DocumentList 
            contract={contract} 
            account={account}
            viewType="creator"
          />
        </div>
      )}

      {isChecker && (
        <div className="checker-dashboard">
          <CheckerDashboard 
            contract={contract} 
            account={account} 
          />
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;


