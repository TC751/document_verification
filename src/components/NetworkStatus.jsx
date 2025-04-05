import React from 'react';

const NetworkStatus = ({ networkName, gasPrice }) => (
    <div className="network-status">
        <div className={`status-indicator ${networkName ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span>Network: {networkName || 'Not Connected'}</span>
        </div>
        <div className="gas-price">
            Gas Price: {gasPrice || 'N/A'} gwei
        </div>
    </div>
);

export default NetworkStatus;