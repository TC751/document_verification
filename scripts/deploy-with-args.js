const hre = require("hardhat");

async function main() {
  // Get network name
  const network = hre.network.name;
  console.log(`Deploying to ${network}...`);

  // Get the contract factory
  const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
  
  // Deploy the contract
  const documentVerification = await DocumentVerification.deploy();
  await documentVerification.deployed();
  
  console.log(`DocumentVerification deployed to: ${documentVerification.address}`);
  
  // Save the contract address and other deployment info
  const fs = require("fs");
  const deployments = {
    network,
    address: documentVerification.address,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    `deployments/${network}.json`,
    JSON.stringify(deployments, null, 2)
  );
  
  return documentVerification;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });