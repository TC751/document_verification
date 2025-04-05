import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import '../styles/components.css';

const SubmitDocument = ({ contract }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    const initializeAccount = async () => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          alert("Please install MetaMask!");
          return;
        }

        const web3 = new Web3(ethereum);
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
          const permissions = await ethereum.request({
            method: 'eth_requestAccounts'
          });
          setAccount(permissions[0]);
        } else {
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Error initializing account:", error);
        alert("Error connecting to MetaMask");
      }
    };

    initializeAccount();
  }, []);

  const calculateHash = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const web3 = new Web3();
      const hash = web3.utils.sha3(bytes);
      console.log('Calculated hash:', hash);
      return hash;
    } catch (error) {
      console.error('Error calculating hash:', error);
      throw new Error('Failed to calculate document hash');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file || !metadata) {
      alert('Please fill in all required fields');
      return;
    }

    if (!account) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    
    try {
      // Get current network
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      console.log('Current network ID:', networkId);

      const documentHash = await calculateHash(file);
      console.log('Document hash:', documentHash);

      // Create metadata object
      const metadataObj = {
        filename: file.name,
        type: file.type,
        size: file.size,
        lastModified: new Date(file.lastModified).toISOString()
      };
      const metadataString = JSON.stringify(metadataObj);

      // Estimate gas first
      const gasEstimate = await contract.methods.registerDocument(
        documentHash,
        metadataString
      ).estimateGas({ from: account });

      console.log('Estimated gas:', gasEstimate);

      // Submit the document with estimated gas + buffer
      const tx = await contract.methods.registerDocument(
        documentHash,
        metadataString
      ).send({ 
        from: account,
        gas: Math.round(gasEstimate * 1.2) // Add 20% buffer to gas estimate
      });
      
      console.log('Transaction receipt:', tx);
      
      setFile(null);
      setMetadata('');
      
      alert('Document submitted successfully!');
    } catch (error) {
      console.error('Detailed error:', error);
      
      // More specific error handling
      if (error.code === 4001) {
        alert('Transaction was rejected by user');
      } else if (error.message.includes('User denied')) {
        alert('Transaction was rejected in MetaMask');
      } else if (error.message.includes('Document already exists')) {
        alert('This document has already been registered');
      } else if (error.message.includes('insufficient funds')) {
        alert('Insufficient funds to complete the transaction');
      } else if (error.message.includes('nonce too low')) {
        alert('Transaction nonce error. Please reset your MetaMask account');
      } else if (error.message.includes('Internal JSON-RPC error')) {
        alert('Network error. Please check if you are connected to the correct network and try again');
        console.error('Full error details:', {
          message: error.message,
          code: error.code,
          data: error.data
        });
      } else {
        alert(`Error submitting document: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submit-document">
      <div className="form-section-header">
        <h2>Submit New Document</h2>
        <p>Upload and register a new document for verification</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="file">Document File:</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="metadata">Document Metadata:</label>
          <textarea
            id="metadata"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder="Enter document metadata..."
            required
          />
        </div>
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Document'}
        </button>
      </form>
    </div>
  );
};

export default SubmitDocument;








