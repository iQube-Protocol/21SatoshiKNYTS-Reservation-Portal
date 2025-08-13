// Check contract status
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking contract status...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("📍 Using account:", deployer.address);
    
    // Connect to the deployed contract
    const contractAddress = "0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638";
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservationClean");
    const contract = await Contract.attach(contractAddress);
    
    // Check various contract status
    console.log("\n📊 Contract Status:");
    
    // Sale state
    const saleActive = await contract.saleIsActive();
    console.log("  Sale active:", saleActive);
    
    // Check prices
    const fullPrice = await contract.fullPrice();
    console.log("  Full price:", ethers.formatEther(fullPrice), "ETH");
    
    const shardPrice = await contract.shardPrice();
    console.log("  Shard price:", ethers.formatEther(shardPrice), "ETH");
    
    // Check referral shard sale
    const referralShardsForSale = await contract.referralShardsCanBeSold();
    console.log("  Referral shards for sale:", referralShardsForSale);
    
    // Supply info
    const supplyInfo = await contract.getSupplyInfo();
    console.log("\n📊 Supply Info:");
    console.log("  Full minted:", supplyInfo[0].toString());
    console.log("  Shard minted:", supplyInfo[1].toString());
    console.log("  Referral shards minted:", supplyInfo[2].toString());
    console.log("  Community shards minted:", supplyInfo[3].toString());
    
    console.log("\n✅ Status check complete!");
    
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
