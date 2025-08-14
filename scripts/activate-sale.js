// Script to activate the sale for the 21 Sats Reservation Contract
require('dotenv').config();
const { ethers } = require('ethers');

async function main() {
  // Initialize provider with Sepolia network
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
  
  // Use the private key from .env to create a signer
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ Private key not found in .env file");
    return;
  }
  
  const signer = new ethers.Wallet(privateKey, provider);
  console.log(`🔑 Using wallet address: ${signer.address}`);
  
  // Contract details
  const contractAddress = "0x02C7bf349bcC667Cb1c8024ED143309592d998a4";
  
  // ABI for just the setSaleState function
  const abi = [
    "function setSaleState(bool _state) external",
    "function saleIsActive() view returns (bool)"
  ];
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  try {
    // Check current sale state
    const currentState = await contract.saleIsActive();
    console.log(`Current sale state: ${currentState ? "ACTIVE ✅" : "INACTIVE ❌"}`);
    
    if (currentState) {
      console.log("Sale is already active! No action needed.");
      return;
    }
    
    // Activate the sale
    console.log("Activating sale...");
    const tx = await contract.setSaleState(true);
    console.log(`Transaction sent! Hash: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    // Wait for transaction to be mined
    await tx.wait();
    
    // Verify the sale is now active
    const newState = await contract.saleIsActive();
    console.log(`\nTransaction confirmed! New sale state: ${newState ? "ACTIVE ✅" : "INACTIVE ❌"}`);
    if (newState) {
      console.log("✨ Sale successfully activated! Users can now mint tokens.");
    } else {
      console.log("⚠️ Something went wrong. Sale is still inactive.");
    }
    
  } catch (error) {
    console.error("\n❌ Error activating sale:", error);
    
    // More helpful error messages
    if (error.message.includes("execution reverted")) {
      console.error("\nPossible reasons:");
      console.error("1. You are not the contract owner/admin");
      console.error("2. The contract doesn't have a setSaleState function with this signature");
      console.error("3. There may be other conditions in the contract preventing sale activation");
      
      console.error("\nTo verify contract owner, please check on Etherscan:");
      console.error(`https://sepolia.etherscan.io/address/${contractAddress}#readContract`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
