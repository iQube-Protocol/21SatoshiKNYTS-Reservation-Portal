// Activate sale on Sepolia testnet
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Activating sale on Sepolia contract...");
  
  try {
    // Get network from Hardhat
    const provider = ethers.provider;
    
    const [deployer] = await ethers.getSigners();
    console.log("📍 Using account:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await provider.getBalance(deployer.address)), "ETH");
    
    // Connect to the deployed contract
    const contractAddress = "0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638";
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservationClean");
    const contract = await Contract.attach(contractAddress);
    
    // Check current sale status
    console.log("📊 Checking current sale status...");
    const currentStatus = await contract.saleIsActive();
    console.log("📊 Current sale status:", currentStatus);
    
    // Toggle sale status
    console.log("🔄 Toggling sale state...");
    const tx = await contract.toggleSaleState({ gasLimit: 100000 });
    console.log("📝 Transaction hash:", tx.hash);
    
    // Wait for confirmation
    console.log("⏳ Waiting for confirmation...");
    await tx.wait();
    console.log("✅ Transaction confirmed!");
    
    // Check new status
    const newStatus = await contract.saleIsActive();
    console.log("📊 New sale status:", newStatus);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
