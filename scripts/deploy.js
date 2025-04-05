const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
  
  // Deploy the contract
  console.log("Deploying DocumentVerification...");
  const documentVerification = await DocumentVerification.deploy();
  await documentVerification.deployed();
  
  console.log("DocumentVerification deployed to:", documentVerification.address);
  
  // Verify the contract on Etherscan for non-local networks
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await documentVerification.deployTransaction.wait(6);
    
    await hre.run("verify:verify", {
      address: documentVerification.address,
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });