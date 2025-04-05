import React, { useState } from 'react';
import Web3 from 'web3';
import '../styles/layout.css';
import '../styles/forms.css';
import { toast } from 'react-toastify';

const UserManagement = ({ contract, account }) => {
  const [newVerifier, setNewVerifier] = useState('');
  const [verifiers, setVerifiers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addVerifier = async () => {
    const web3 = new Web3();
    if (!web3.utils.isAddress(newVerifier)) {
      setError('Invalid Ethereum address');
      return;
    }

    setIsLoading(true);
    try {
      const tx = await contract.methods.addVerifier(newVerifier)
        .send({ from: account });
      
      setVerifiers([...verifiers, newVerifier]);
      setNewVerifier('');
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const removeVerifier = async (address) => {
    setIsLoading(true);
    try {
      const tx = await contract.methods.removeVerifier(address)
        .send({ from: account });
      
      setVerifiers(verifiers.filter(v => v !== address));
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="form-section">
        <div className="form-section-header">
          <h2>User Management</h2>
          <p>Add or remove verifiers from the system</p>
        </div>
        
        <div className="form-section-body">
          <div className="form-group">
            <label className="form-label" htmlFor="verifierAddress">
              Verifier Address
            </label>
            <div className="grid grid-2-cols" style={{ gap: '1rem' }}>
              <input
                id="verifierAddress"
                className={`form-control ${error ? 'error' : ''}`}
                type="text"
                placeholder="Enter Ethereum address"
                value={newVerifier}
                onChange={(e) => setNewVerifier(e.target.value)}
              />
              <button 
                className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
                onClick={addVerifier}
                disabled={isLoading}
              >
                Add Verifier
              </button>
            </div>
            {error && <div className="error-message">{error}</div>}
          </div>
          
          {verifiers.length > 0 && (
            <div className="verifiers-list">
              <h3>Current Verifiers</h3>
              <ul>
                {verifiers.map((address) => (
                  <li key={address}>
                    {address}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeVerifier(address)}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

// Using the addVerifier function:
const addNewVerifier = async () => {
  const verifierAddress = '0x787E3BEE259e178ecb6a02E3d87d9C0701581b79';
  
  try {
    await contract.methods.addVerifier(verifierAddress)
      .send({ 
        from: '0xAa1Cd5B76Fa4e79c3b7DE6d0a1cD392E14f0413F',  // Your admin account
        gas: 200000
      }); 
    
    console.log('Verifier added successfully');
  } catch (error) {
    console.error('Failed to add verifier:', error.message);
  }
};




