const config = {
  networks: {
    ganache: {
      contractAddress: "0x8b9eCCDdf09a31d11333784E2D1ecd3b7411C184",
      rpcUrl: "http://127.0.0.1:7545"
    },
    sepolia: {
      contractAddress: process.env.REACT_APP_SEPOLIA_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
      rpcUrl: `https://sepolia.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
    }
  },
  accounts: {
    admin: "0x67869f5C7d4DfC3A973CabE6bd91D0b3b9aa02F4",  // Your admin account
    maker: "0x4c96d6aA0305655E88909F9fC5434767d007Ff68"   // Your maker account
  },
  contracts_directory: './src/artifacts/contracts'
};

export default config;









