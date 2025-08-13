// Test which functions exist on the deployed contract
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing contract functions...");
  
  try {
    const [deployer] = await ethers.getSigners();
    const contractAddress = "0x00C61eBf76063d286758fb90E75F4cBBF2f5f958";
    
    // Get the contract factory to get the full ABI
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservation");
    const contract = Contract.attach(contractAddress);
    
    console.log("📋 Testing basic functions:");
    
    // Test basic functions
    try {
      const saleActive = await contract.saleIsActive();
      console.log("✅ saleIsActive():", saleActive);
    } catch (e) {
      console.log("❌ saleIsActive() failed:", e.message);
    }
    
    try {
      const supplyInfo = await contract.getSupplyInfo();
      console.log("✅ getSupplyInfo():", supplyInfo.toString());
    } catch (e) {
      console.log("❌ getSupplyInfo() failed:", e.message);
    }
    
    console.log("\n📋 Testing referral functions:");
    
    // Test referral functions
    try {
      const canReceive = await contract.canReceiveReferralReward();
      console.log("✅ canReceiveReferralReward():", canReceive);
    } catch (e) {
      console.log("❌ canReceiveReferralReward() failed:", e.message);
    }
    
    try {
      const stats = await contract.getReferralStats(deployer.address);
      console.log("✅ getReferralStats():", stats.toString());
    } catch (e) {
      console.log("❌ getReferralStats() failed:", e.message);
    }
    
    // Test if the contract has the new mint function
    console.log("\n📋 Testing mint functions:");
    
    try {
      // Try to estimate gas for the new mint function (without actually calling it)
      const gasEstimate = await contract.mintFull.estimateGas(1, deployer.address, {
        value: ethers.parseEther("0.01")
      });
      console.log("✅ mintFull(quantity, referrer) exists, gas estimate:", gasEstimate.toString());
    } catch (e) {
      console.log("❌ mintFull(quantity, referrer) failed:", e.message);
    }
    
    try {
      // Try the old mint function
      const gasEstimate = await contract.mintFull.estimateGas(1, {
        value: ethers.parseEther("0.01")
      });
      console.log("✅ mintFull(quantity) exists, gas estimate:", gasEstimate.toString());
    } catch (e) {
      console.log("❌ mintFull(quantity) failed:", e.message);
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);
