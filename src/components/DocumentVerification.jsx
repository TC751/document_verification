import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import LoadingSpinner from './LoadingSpinner';
import DocumentList from './DocumentList';
import VerificationStatus from './VerificationStatus';
import NetworkStatus from './NetworkStatus';
import DocumentVerification from '../artifacts/contracts/DocumentVerification.json';
import config from '../config';
import '../styles/DocumentVerification.css';
import { handleContractError, validateDocument } from '../utils/errorHandling';

const DocumentVerificationComponent = ({ contract, account }) => {
    const [documents, setDocuments] = useState([]); // Initialize as empty array
    const [file, setFile] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        verified: 0,
        rejected: 0
    });
    const [isVerifier, setIsVerifier] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [networkInfo, setNetworkInfo] = useState({
        name: '',
        gasPrice: ''
    });

    useEffect(() => {
        initializeContract();
    }, []);

    const initializeContract = async () => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                throw new Error("Please install MetaMask!");
            }

            const web3 = new Web3(ethereum);
            const network = await web3.eth.net.getId();
            const networkName = network === 1337 ? 'ganache' : 'sepolia';
            
            const gasPrice = await web3.eth.getGasPrice();
            const gasPriceGwei = web3.utils.fromWei(gasPrice, 'gwei');

            setNetworkInfo({
                name: networkName,
                gasPrice: gasPriceGwei
            });

            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];
            
            const contractAddress = config.networks[networkName]?.contractAddress;
            
            if (!contractAddress) {
                throw new Error(`Contract not deployed on ${networkName}`);
            }

            const contractInstance = new web3.eth.Contract(
                DocumentVerification.abi,
                contractAddress
            );

            setContract(contractInstance);
        } catch (error) {
            setError(handleContractError(error));
        }
    };

    const loadDocuments = async () => {
        if (!contract) return;

        try {
            setLoading(true);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            
            const docHashes = await contract.methods.getUserDocuments().call({ from: account });
            
            if (!Array.isArray(docHashes)) {
                console.error('Document hashes is not an array:', docHashes);
                setDocuments([]);
                return;
            }

            const documentPromises = docHashes.map(async (hash) => {
                try {
                    const doc = await contract.methods.getDocument(hash).call();
                    return {
                        hash,
                        status: doc.status,
                        timestamp: new Date(Number(doc.timestamp) * 1000),
                        expiryDate: new Date(Number(doc.expiryDate) * 1000),
                        metadata: doc.metadata ? JSON.parse(doc.metadata) : {},
                        verifier: doc.verifier
                    };
                } catch (error) {
                    console.error(`Error loading document ${hash}:`, error);
                    return null;
                }
            });
            
            const resolvedDocs = (await Promise.all(documentPromises)).filter(doc => doc !== null);
            setDocuments(resolvedDocs);
            updateStats(resolvedDocs);
        } catch (error) {
            console.error('Error loading documents:', error);
            setError(`Failed to load documents: ${error.message}`);
            setDocuments([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        const errors = validateDocument(uploadedFile);
        
        if (errors.length > 0) {
            setError(errors.join(', '));
            return;
        }
        
        setFile(uploadedFile);
        setError('');
    };

    const registerDocument = async () => {
        if (!file || !contract) {
            setError('Please select a file and ensure wallet is connected');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            const web3 = new Web3();
            const hash = web3.utils.sha3(bytes);
            
            const metadata = JSON.stringify({
                filename: file.name,
                type: file.type,
                size: file.size,
                lastModified: new Date(file.lastModified).toISOString()
            });

            const accounts = await web3.eth.getAccounts();
            const account = accounts[0];

            await contract.methods.registerDocument(hash, metadata)
                .send({ from: account });
            
            await loadDocuments();
            setFile(null);
            document.querySelector('input[type="file"]').value = '';
        } catch (error) {
            setError(handleContractError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (hash, newStatus) => {
        if (!contract || !isVerifier) return;

        try {
            setLoading(true);
            const tx = await contract.updateStatus(hash, newStatus);
            await tx.wait();
            await loadDocuments();
        } catch (error) {
            setError(`Status update failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (docs) => {
        const stats = docs.reduce((acc, doc) => {
            acc.total++;
            acc[doc.status.toLowerCase()]++;
            return acc;
        }, { total: 0, verified: 0, pending: 0, rejected: 0 });
        setStats(stats);
    };

    return (
        <div className="document-verification">
            <NetworkStatus 
                networkName={networkInfo.name}
                gasPrice={networkInfo.gasPrice}
            />
            
            {error && <div className="error-message">{error}</div>}
            {loading && <LoadingSpinner />}
            
            <VerificationStatus stats={stats} />
            
            <div className="upload-section">
                <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={loading}
                />
                <button 
                    onClick={registerDocument}
                    disabled={loading || !file}
                >
                    Register Document
                </button>
            </div>

            <DocumentList 
                documents={documents}
                contract={contract}
                account={account}
                onDocumentUpdate={loadDocuments}
            />
        </div>
    );
};

export default DocumentVerificationComponent;













