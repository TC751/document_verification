import React, { useState, useEffect } from 'react';
import DocumentVerification from './artifacts/contracts/DocumentVerification.json';
import DocumentManagement from './components/DocumentManagement';
import NetworkStatus from './components/NetworkStatus';
import { connectWallet, getWeb3 } from './utils/web3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const App = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isChecker, setIsChecker] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({
    name: null,
    gasPrice: null
  });
  const [availableAccounts, setAvailableAccounts] = useState([]);

  const initializeWeb3 = async () => {
    try {
      setIsInitializing(true);
      const { web3, accounts, account, networkName, gasPrice } = await connectWallet();
      setAccount(account);
      setAvailableAccounts(accounts);
      setNetworkInfo({ name: networkName, gasPrice });

      // Initialize contract
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DocumentVerification.networks[networkId];
      
      if (!deployedNetwork) {
        toast.error('Contract not deployed on this network');
        setIsInitializing(false);
        return;
      }

      const instance = new web3.eth.Contract(
        DocumentVerification.abi,
        deployedNetwork.address
      );
      setContract(instance);

      // Check if user is checker
      try {
        const checkerAddress = await instance.methods.checker().call();
        setIsChecker(account.toLowerCase() === checkerAddress.toLowerCase());
      } catch (error) {
        console.error('Could not determine checker status:', error);
        setIsChecker(false);
      }

      // Setup event listeners
      window.ethereum.on('accountsChanged', handleAccountChange);
      window.ethereum.on('chainChanged', () => window.location.reload());

    } catch (error) {
      toast.error(error.message);
      console.error('Initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAccountChange = async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsChecker(false);
    } else {
      setAccount(accounts[0]);
      if (contract) {
        try {
          const checkerAddress = await contract.methods.checker().call();
          setIsChecker(accounts[0].toLowerCase() === checkerAddress.toLowerCase());
        } catch (error) {
          console.error('Could not determine checker status:', error);
          setIsChecker(false);
        }
      }
    }
  };

  const switchAccount = async (selectedAccount) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x539' }], // Chain ID 1337 in hex
      });

      await window.ethereum.request({
        method: 'wallet_requestPermissions',
        params: [{
          eth_accounts: {}
        }]
      });

      await window.ethereum.request({
        method: 'eth_requestAccounts',
        params: [{ eth: selectedAccount }],
      });
      
      setAccount(selectedAccount);
      
      if (contract) {
        const checkerAddress = await contract.methods.checker().call();
        setIsChecker(selectedAccount.toLowerCase() === checkerAddress.toLowerCase());
      }
    } catch (error) {
      toast.error('Failed to switch account');
      console.error(error);
    }
  };

  useEffect(() => {
    const loadAccounts = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          setAvailableAccounts(accounts);
          
          if (!account && accounts.length > 0) {
            const selectedAccount = accounts[0];
            setAccount(selectedAccount);
            
            if (contract) {
              const checkerAddress = await contract.methods.checker().call();
              setIsChecker(selectedAccount.toLowerCase() === checkerAddress.toLowerCase());
            }
          }
        } catch (error) {
          console.error('Error loading accounts:', error);
          toast.error('Failed to load accounts');
        }
      }
    };
    
    loadAccounts();
  }, [account, contract]);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          await initializeWeb3();
        } catch (error) {
          console.error('Initialization error:', error);
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  if (isInitializing) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">Connecting to Web3...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ToastContainer position="top-right" />
      <header className="app-header">
        <h1>Document Verification System</h1>
        <NetworkStatus 
          networkName={networkInfo.name}
          gasPrice={networkInfo.gasPrice}
        />
      </header>

      {!account ? (
        <div className="connect-prompt">
          <button onClick={initializeWeb3} className="connect-button">
            Connect Wallet
          </button>
        </div>
      ) : !contract ? (
        <div className="error-message">
          Contract not deployed on this network. Please switch to the correct network.
        </div>
      ) : (
        <DocumentManagement
          contract={contract}
          account={account}
          isChecker={isChecker}
          availableAccounts={availableAccounts}
          onSwitchAccount={switchAccount}
        />
      )}
    </div>
  );
};

export default App;








