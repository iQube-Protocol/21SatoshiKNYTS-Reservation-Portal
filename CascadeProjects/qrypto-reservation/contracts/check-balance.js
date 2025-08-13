require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("Checking wallet balance on Sepolia...");
    
    const [deployer] = await ethers.getSigners();
    console.log(`Wallet address: ${deployer.address}`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
      console.log("❌ No ETH balance! You need Sepolia testnet ETH to deploy.");
      console.log("Get testnet ETH from: https://sepoliafaucet.com/");
    } else {
      console.log("✅ Wallet has sufficient balance for deployment");
    }
    
    // Test network connection
    const blockNumber = await ethers.provider.getBlockNumber();
    console.log(`Current block number: ${blockNumber}`);
    
  } catch (error) {
    console.error("Error checking balance:", error.message);
  }
}

main().catch(console.error);
