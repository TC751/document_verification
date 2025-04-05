import React, { useState } from 'react';
import '../styles/components.css';
import Web3 from 'web3';

const TestPanel = ({ contract, account, isAdmin }) => {
    const [newVerifier, setNewVerifier] = useState('');
    const [testFile, setTestFile] = useState(null);
    const [status, setStatus] = useState('');

    const addVerifier = async () => {
        try {
            const verifierAddress = '0x787E3BEE259e178ecb6a02E3d87d9C0701581b79';
            setStatus('Adding verifier...');
            
            const tx = await contract.methods.addVerifier(verifierAddress, "Test Verifier")
                .send({ 
                    from: '0xAa1Cd5B76Fa4e79c3b7DE6d0a1cD392E14f0413F',
                    gas: 200000 
                });
                
            setStatus(`Successfully added verifier: ${verifierAddress}`);
            console.log('Transaction:', tx);
        } catch (error) {
            setStatus(`Error: ${error.message}`);
            console.error("Error adding verifier:", error);
        }
    };

    const calculateHash = async (file) => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    };

    const registerTestDocument = async () => {
        try {
            setStatus('Registering document...');
            const hash = await calculateHash(testFile);
            
            const metadata = JSON.stringify({
                filename: testFile.name,
                type: testFile.type,
                size: testFile.size,
                timestamp: Date.now()
            });

            const tx = await contract.registerDocument(hash, metadata);
            await tx.wait();
            setStatus(`Successfully registered document with hash: ${hash}`);
        } catch (error) {
            setStatus(`Error: ${error.message}`);
        }
    };

    const checkSetup = async () => {
        try {
            // Check contract owner/admin
            const admin = await contract.methods.checker().call();
            console.log('Admin account:', admin);
            console.log('Should match:', '0xAa1Cd5B76Fa4e79c3b7DE6d0a1cD392E14f0413F');
            
            // Check balance of both accounts
            const web3 = new Web3(window.ethereum);
            const balance1 = await web3.eth.getBalance('0xAa1Cd5B76Fa4e79c3b7DE6d0a1cD392E14f0413F');
            const balance2 = await web3.eth.getBalance('0x787E3BEE259e178ecb6a02E3d87d9C0701581b79');
            
            console.log('Admin balance:', web3.utils.fromWei(balance1, 'ether'), 'ETH');
            console.log('Verifier balance:', web3.utils.fromWei(balance2, 'ether'), 'ETH');
        } catch (error) {
            console.error('Setup check failed:', error);
        }
    };

    return (
        <div className="test-panel">
            <div className="test-panel-header">
                <h3>Test Panel</h3>
            </div>
            
            <div className="test-panel-body">
                {isAdmin && (
                    <div className="test-section">
                        <h4>Add Verifier</h4>
                        <div className="form-group">
                            <input 
                                type="text" 
                                className="form-control"
                                placeholder="Verifier Address"
                                value={newVerifier}
                                onChange={(e) => setNewVerifier(e.target.value)}
                            />
                            <button 
                                className="btn btn-primary"
                                onClick={addVerifier} 
                                disabled={!newVerifier}
                            >
                                Add Verifier
                            </button>
                        </div>
                    </div>
                )}

                <div className="test-section">
                    <h4>Register Test Document</h4>
                    <div className="form-group">
                        <input 
                            type="file"
                            className="form-control"
                            onChange={(e) => setTestFile(e.target.files[0])}
                        />
                        <button 
                            className="btn btn-primary"
                            onClick={registerTestDocument}
                            disabled={!testFile}
                        >
                            Register Test Document
                        </button>
                    </div>
                </div>

                <div className="test-section">
                    <h4>Status:</h4>
                    <pre className="status-display">{status}</pre>
                </div>

                <div className="test-section">
                    <h4>Connected Account:</h4>
                    <pre className="account-display">{account}</pre>
                </div>
            </div>
        </div>
    );
};

export default TestPanel;








