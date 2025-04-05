import Web3 from 'web3';

export const connectWallet = async () => {
    if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
    }

    try {
        // Create Web3 instance using window.ethereum
        const web3 = new Web3(window.ethereum);
        
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        // Get network info
        const networkId = await web3.eth.net.getId();
        const networkName = getNetworkName(networkId);
        
        // Get gas price
        const gasPrice = await web3.eth.getGasPrice();
        const gasPriceGwei = web3.utils.fromWei(gasPrice, 'gwei');

        return {
            web3,
            accounts,
            account: accounts[0],
            networkName,
            gasPrice: gasPriceGwei
        };
    } catch (error) {
        throw new Error("Failed to connect to wallet: " + error.message);
    }
};

export const getWeb3 = () => {
    if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
    }
    return new Web3(window.ethereum);
};

const getNetworkName = (networkId) => {
    switch (networkId) {
        case 1:
            return 'Mainnet';
        case 3:
            return 'Ropsten';
        case 4:
            return 'Rinkeby';
        case 5:
            return 'Goerli';
        case 42:
            return 'Kovan';
        case 1337:
            return 'Local';
        default:
            return 'Unknown';
    }
};

