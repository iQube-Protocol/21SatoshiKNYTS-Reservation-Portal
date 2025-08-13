// Enable referral shards for sale
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔄 Enabling referral shards for sale...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("📍 Using account:", deployer.address);
    
    // Connect to the deployed contract
    const contractAddress = "0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638";
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservationClean");
    const contract = await Contract.attach(contractAddress);
    
    // Check current status
    const currentStatus = await contract.referralShardsCanBeSold();
    console.log("📊 Current referral shards status:", currentStatus);
    
    if (!currentStatus) {
      console.log("🔄 Opening referral shards for sale...");
      const tx = await contract.openReferralShardsForSale();
      console.log("📝 Transaction hash:", tx.hash);
      
      console.log("⏳ Waiting for confirmation...");
      await tx.wait();
      console.log("✅ Transaction confirmed!");
      
      // Check new status
      const newStatus = await contract.referralShardsCanBeSold();
      console.log("📊 New referral shards status:", newStatus);
    } else {
      console.log("✅ Referral shards are already available for sale!");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
