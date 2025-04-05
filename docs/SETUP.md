# Document Verification DApp Setup Guide

## Prerequisites

- Node.js v18.x
- npm or yarn
- MetaMask browser extension
- Git

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd document-verification-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
INFURA_API_KEY=your_infura_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
REACT_APP_INFURA_API_KEY=${INFURA_API_KEY}
```

## Local Development

1. Start local Hardhat node:
```bash
npx hardhat node
```

2. Deploy contracts (in a new terminal):
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Start the React frontend:
```bash
npm start
```

## MetaMask Configuration

1. Network Settings:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. Import a test account from Hardhat node using the private key

## Testing

Run the test suite:
```bash
npx hardhat test
```

For gas optimization tests:
```bash
REPORT_GAS=true npx hardhat test
```

## Deployment

### Testnet (Sepolia)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Usage Guide

1. **Connecting Wallet**
   - Click "Connect Wallet" button
   - Approve MetaMask connection

2. **Document Registration**
   - Select file to upload
   - Click "Register Document"
   - Confirm transaction in MetaMask

3. **Verifier Actions**
   - Verifiers can approve/reject documents
   - View verification statistics

4. **Document Status**
   - Pending: Newly registered documents
   - Verified: Approved by verifier
   - Rejected: Rejected by verifier
   - Expired: Past validity period (365 days)

## Architecture

The system consists of three main components:

1. Smart Contract (Solidity)
   - Document registration
   - Verification logic
   - Access control
   - Status management

2. Frontend (React)
   - User interface
   - MetaMask integration
   - Document upload
   - Status display

3. Backend Services
   - IPFS integration (optional)
   - Event monitoring
   - API endpoints

## Security Considerations

1. Access Control
   - Only owner can add/remove verifiers
   - Only verifiers can approve/reject documents
   - Users can only register documents

2. Document Validation
   - Duplicate prevention
   - Size limitations
   - Format verification

3. Gas Optimization
   - Efficient storage usage
   - Batch operations where possible
   - Event logging optimization