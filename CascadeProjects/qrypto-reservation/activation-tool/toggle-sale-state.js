// Script to toggle sale state for the 21 Sats Reservation Contract
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
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
  
  const cleanedKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
  const signer = new ethers.Wallet(cleanedKey, provider);
  console.log(`🔑 Using wallet address: ${signer.address}`);
  
  // Contract details
  const contractAddress = "0x02C7bf349bcC667Cb1c8024ED143309592d998a4";
  
  // ABI with the correct function name from the contract
  const abi = [
    "function toggleSaleState() external",
    "function saleIsActive() view returns (bool)"
  ];
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, abi, signer);
  
  try {
    // Check current sale state
    console.log("Checking current sale state...");
    const currentState = await contract.saleIsActive();
    console.log(`Current sale state: ${currentState ? "ACTIVE ✅" : "INACTIVE ❌"}`);
    
    // Toggle the sale state
    console.log("\nToggling sale state...");
    const tx = await contract.toggleSaleState();
    console.log(`Transaction sent! Hash: ${tx.hash}`);
    console.log("Waiting for transaction confirmation...");
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    console.log(`Transaction confirmed! Block: ${receipt.blockNumber}`);
    
    // Verify the new sale state
    const newState = await contract.saleIsActive();
    console.log(`\nNew sale state: ${newState ? "ACTIVE ✅" : "INACTIVE ❌"}`);
    
    if (newState) {
      console.log("✨ Sale successfully activated! Users can now mint tokens.");
    } else {
      console.log("⚠️ Sale was toggled to INACTIVE.");
    }
    
  } catch (error) {
    console.error("\n❌ Error toggling sale state:", error.message);
    console.log("\nDo you have enough ETH for gas fees?");
  }
}

main().catch(console.error);
