// Simple deployment script with better error handling
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting simple deployment...");
  
  try {
    // Get deployer
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.003")) {
      throw new Error("❌ Insufficient balance. Need at least 0.003 ETH");
    }
    
    // Get contract factory
    console.log("📦 Getting contract factory...");
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservation");
    
    // Deploy with explicit gas settings
    console.log("⏳ Deploying contract...");
    const contract = await Contract.deploy(
      ethers.parseEther("0.01"),  // fullPrice
      ethers.parseEther("0.001"), // shardPrice  
      "https://api.21sats.com/metadata/", // baseURI
      {
        gasLimit: 2500000,
        gasPrice: ethers.parseUnits("20", "gwei")
      }
    );
    
    console.log("📝 Transaction hash:", contract.deploymentTransaction().hash);
    console.log("⏳ Waiting for confirmation...");
    
    // Wait for deployment with timeout
    const receipt = await Promise.race([
      contract.waitForDeployment(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Deployment timeout")), 180000)
      )
    ]);
    
    const address = await contract.getAddress();
    console.log("✅ Contract deployed!");
    console.log("📍 Address:", address);
    
    // Test the contract
    console.log("🔍 Testing contract...");
    const saleStatus = await contract.saleIsActive();
    console.log("📊 Sale active:", saleStatus);
    
    console.log("\n🎉 Deployment successful!");
    console.log("📋 Update your config with:", address);
    
  } catch (error) {
    console.error("❌ Deployment failed:");
    console.error("Message:", error.message);
    if (error.reason) console.error("Reason:", error.reason);
    if (error.code) console.error("Code:", error.code);
    process.exit(1);
  }
}

main().catch(console.error);
