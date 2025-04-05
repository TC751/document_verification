// Import the DocumentVerification contract
const DocumentVerification = artifacts.require("DocumentVerification");

module.exports = function(deployer) {
  // Deploy the DocumentVerification contract
  deployer.deploy(DocumentVerification);
};