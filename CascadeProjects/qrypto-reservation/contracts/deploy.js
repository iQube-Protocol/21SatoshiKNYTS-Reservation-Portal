// deploy.js
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  try {
    console.log("🚀 Deploying 21 Sats Reservation Contract with Referral System...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`📍 Deploying from account: ${deployer.address}`);
    
    // Check balance
    const provider = ethers.provider;
    const balance = await provider.getBalance(deployer.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance < ethers.parseEther("0.005")) {
      throw new Error("Insufficient balance for deployment. Need at least 0.005 ETH");
    }
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    console.log(`⛽ Current gas price: ${ethers.formatUnits(feeData.gasPrice, "gwei")} gwei`);
    
    // Deploy contract
    console.log("📦 Getting contract factory...");
    const SatoshiKNYTReservation = await ethers.getContractFactory("SatoshiKNYTReservation");
    
    // Use lower prices for testnet
    const fullPrice = ethers.parseEther("0.01");  // 0.01 ETH
    const shardPrice = ethers.parseEther("0.001"); // 0.001 ETH
    const baseURI = "https://api.21sats.com/metadata/";
    
    console.log("🔧 Deploying with parameters:");
    console.log(`- Full price: ${ethers.formatEther(fullPrice)} ETH`);
    console.log(`- Shard price: ${ethers.formatEther(shardPrice)} ETH`);
    console.log(`- Base URI: ${baseURI}`);
    
    console.log("⏳ Sending deployment transaction...");
    const contract = await SatoshiKNYTReservation.deploy(fullPrice, shardPrice, baseURI, {
      gasLimit: 3000000 // Set explicit gas limit
    });
    
    console.log(`📝 Deployment transaction sent: ${contract.deploymentTransaction().hash}`);
    console.log("⏳ Waiting for deployment confirmation...");
    
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log("✅ Contract deployed successfully!");
    console.log(`📍 Contract address: ${contractAddress}`);
    console.log(`🔗 Transaction hash: ${contract.deploymentTransaction().hash}`);
    
    // Verify deployment by calling a simple function
    console.log("🔍 Verifying deployment...");
    const saleStatus = await contract.saleIsActive();
    console.log(`📊 Sale status: ${saleStatus}`);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log(`📋 Update your frontend config with: ${contractAddress}`);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
    if (error.code) console.error("Error code:", error.code);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
