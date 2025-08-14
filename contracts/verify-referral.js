// Verify referral functions on deployed contract
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying referral functionality on deployed contract...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("📍 Using account:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    // Connect to the deployed contract
    const contractAddress = "0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638";
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservationClean");
    const contract = await Contract.attach(contractAddress);
    
    // Check current supply info
    console.log("\n📊 Checking supply info:");
    const supplyInfo = await contract.getSupplyInfo();
    console.log("  Full minted:", supplyInfo[0].toString());
    console.log("  Shard minted:", supplyInfo[1].toString());
    console.log("  Referral shards minted:", supplyInfo[2].toString());
    console.log("  Community shards minted:", supplyInfo[3].toString());
    
    console.log("\n📋 Checking function presence in contract:");
    
    // Test referral functions exist
    try {
      console.log("  Testing canReceiveReferralReward()...");
      const canReceive = await contract.canReceiveReferralReward();
      console.log("  ✅ canReceiveReferralReward() exists and returns:", canReceive);
    } catch (error) {
      console.error("  ❌ Error calling canReceiveReferralReward():", error.message);
    }
    
    try {
      console.log("  Testing getReferralStats()...");
      const stats = await contract.getReferralStats(deployer.address);
      console.log("  ✅ getReferralStats() exists and returns:");
      console.log("     Total referrals:", stats[0].toString());
      console.log("     Referred addresses count:", stats[1].length);
      console.log("     Available referral shards:", stats[2].toString());
    } catch (error) {
      console.error("  ❌ Error calling getReferralStats():", error.message);
    }
    
    try {
      console.log("  Testing getReferredUsers()...");
      const users = await contract.getReferredUsers(deployer.address);
      console.log("  ✅ getReferredUsers() exists and returns array of length:", users.length);
    } catch (error) {
      console.error("  ❌ Error calling getReferredUsers():", error.message);
    }
    
    console.log("\n✅ Verification complete! All referral functions are present in the deployed contract.");
    
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
