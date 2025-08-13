// Try alternative function names to activate sale
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Initialize provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
  const privateKey = process.env.PRIVATE_KEY;
  const cleanedKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
  const wallet = new ethers.Wallet(cleanedKey, provider);
  console.log('Using wallet address:', wallet.address);
  
  // Contract details
  const contractAddress = "0x02C7bf349bcC667Cb1c8024ED143309592d998a4";
  
  // ABI with alternative function names commonly used in NFT contracts
  const abi = [
    "function flipSaleState() external",
    "function saleIsActive() view returns (bool)"
  ];
  
  // Create contract instance
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  try {
    // Check current sale state
    console.log("Checking current sale state...");
    const currentState = await contract.saleIsActive();
    console.log(`Current sale state: ${currentState ? "ACTIVE ✅" : "INACTIVE ❌"}`);
    
    if (currentState) {
      console.log("Sale is already active! No action needed.");
      return;
    }
    
    // Activate the sale using flipSaleState
    console.log("\nActivating sale using flipSaleState()...");
    const tx = await contract.flipSaleState();
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
    console.error("\n❌ Error activating sale:", error.message);
    console.error("\nFull error details:", error);
    
    // More helpful guidance
    console.log("\n----- TROUBLESHOOTING TIPS -----");
    console.log("1. The contract might use a different function name for activation");
    console.log("2. Check if you have enough ETH for gas fees");
    console.log("3. View the contract code on Etherscan to confirm the correct function name:");
    console.log(`   https://sepolia.etherscan.io/address/${contractAddress}#code`);
  }
}

main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
