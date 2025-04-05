import React from 'react';

const Navbar = ({ account, isAdmin, isVerifier }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Document Verification DApp</h1>
      </div>
      
      <div className="navbar-account">
        <div className="account-type">
          {isAdmin && <span className="badge admin-badge">Admin</span>}
          {isVerifier && <span className="badge verifier-badge">Verifier</span>}
        </div>
        <div className="account-address">
          {account ? (
            <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
          ) : (
            <span>Not Connected</span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;