// Test minting with referrer on the deployed contract
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing mintFullWithReferrer functionality...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer account:", deployer.address);
    // Use a fixed test address for referrer since we don't have multiple test accounts
    const testReferrerAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    console.log("📍 Test referrer address:", testReferrerAddress);
    
    // Connect to the deployed contract
    const contractAddress = "0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638";
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservationClean");
    const contract = await Contract.attach(contractAddress);
    
    // Check price
    const fullPrice = await contract.fullPrice();
    console.log("💰 Full price:", ethers.formatEther(fullPrice), "ETH");
    
    // Mint with referrer
    console.log("\n🔄 Minting with referrer...");
    const tx = await contract.mintFullWithReferrer(
      1, // quantity
      testReferrerAddress, // referrer address
      { 
        value: fullPrice, 
        gasLimit: 500000 
      }
    );
    console.log("📝 Transaction hash:", tx.hash);
    
    // Wait for confirmation
    console.log("⏳ Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    
    // Check events
    console.log("\n📋 Checking for ReferralReward events...");
    const referralRewardEvent = receipt.logs
      .filter(log => log.topics[0] === contract.interface.getEvent('ReferralReward').topichash);
    
    if (referralRewardEvent.length > 0) {
      console.log("✅ ReferralReward event found!");
    } else {
      console.log("⚠️ No ReferralReward event found");
    }
    
    // Check referral stats after minting
    console.log("\n📊 Checking referral stats for referrer after minting:");
    try {
      const stats = await contract.getReferralStats(testReferrerAddress);
      console.log("  Total referrals:", stats[0].toString());
      console.log("  Referred addresses count:", stats[1].length);
      console.log("  Available referral shards:", stats[2].toString());
    } catch (error) {
      console.error("❌ Error getting referral stats:", error.message);
    }
    
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
