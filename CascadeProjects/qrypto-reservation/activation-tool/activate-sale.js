// Script to activate the sale for the 21 Sats Reservation Contract
// ESM style module for ethers v6
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Setup for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config();

async function main() {
  // Initialize provider with Sepolia network
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
  
  // Use the private key from .env to create a signer
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ Private key not found in .env file");
    return;
  }
  
  // Remove '0x' prefix if present for ethers v6
  const cleanedKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
  const signer = new ethers.Wallet(cleanedKey, provider);
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
    console.log("Checking current sale state...");
    const currentState = await contract.saleIsActive();
    console.log(`Current sale state: ${currentState ? "ACTIVE ✅" : "INACTIVE ❌"}`);
    
    if (currentState) {
      console.log("Sale is already active! No action needed.");
      return;
    }
    
    // Activate the sale
    console.log("\nActivating sale...");
    const tx = await contract.setSaleState(true);
    console.log(`Transaction sent! Hash: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction confirmed! Block: ${receipt.blockNumber}`);
    
    // Verify the sale is now active
    const newState = await contract.saleIsActive();
    console.log(`\nNew sale state: ${newState ? "ACTIVE ✅" : "INACTIVE ❌"}`);
    if (newState) {
      console.log("✨ Sale successfully activated! Users can now mint tokens.");
    } else {
      console.log("⚠️ Something went wrong. Sale is still inactive.");
    }
    
  } catch (error) {
    console.error("\n❌ Error activating sale:");
    
    // More detailed error handling for common issues
    if (error.message) {
      console.error(`Error message: ${error.message}`);
      
      if (error.message.includes("execution reverted")) {
        console.error("\nPossible reasons:");
        console.error("1. You are not the contract owner/admin");
        console.error("2. The contract doesn't have a setSaleState function with this signature");
        console.error("3. There may be other conditions in the contract preventing sale activation");
        
        console.error("\nTo verify contract owner, please check on Etherscan:");
        console.error(`https://sepolia.etherscan.io/address/${contractAddress}#readContract`);
      } else if (error.message.includes("account doesn't exist")) {
        console.error("Your wallet address doesn't have any ETH. Please fund your wallet first.");
      } else if (error.message.includes("insufficient funds")) {
        console.error("Your wallet doesn't have enough ETH to pay for gas.");
      }
    }
    
    console.error("\nFull error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
