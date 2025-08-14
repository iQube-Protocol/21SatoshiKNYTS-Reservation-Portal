// Activate sale on the new contract
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Activating sale on new contract...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("📍 Using account:", deployer.address);
    
    // Connect to the new contract
    const contractAddress = "0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638";
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservationClean");
    const contract = Contract.attach(contractAddress);
    
    // Check current sale status
    const currentStatus = await contract.saleIsActive();
    console.log("📊 Current sale status:", currentStatus);
    
    if (!currentStatus) {
      console.log("⏳ Activating sale...");
      const tx = await contract.toggleSaleState();
      console.log("📝 Transaction hash:", tx.hash);
      
      await tx.wait();
      console.log("✅ Transaction confirmed!");
      
      // Verify activation
      const newStatus = await contract.saleIsActive();
      console.log("📊 New sale status:", newStatus);
      
      if (newStatus) {
        console.log("🎉 Sale successfully activated!");
      } else {
        console.log("❌ Sale activation failed");
      }
    } else {
      console.log("✅ Sale is already active!");
    }
    
    // Show contract info
    console.log("\n📋 Contract Info:");
    console.log("Address:", contractAddress);
    console.log("Sale Active:", await contract.saleIsActive());
    console.log("Full Price:", ethers.formatEther(await contract.fullPrice()), "ETH");
    console.log("Shard Price:", ethers.formatEther(await contract.shardPrice()), "ETH");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main().catch(console.error);
