// test-contract.js
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  try {
    // Contract address on Sepolia
    const contractAddress = "0x02C7bf349bcC667Cb1c8024ED143309592d998a4";
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log(`Testing with account: ${signer.address}`);
    
    // Get contract instance
    const contract = await ethers.getContractAt("SatoshiKNYTReservation", contractAddress, signer);
    
    // Get contract info
    const name = await contract.name();
    const symbol = await contract.symbol();
    const fullPrice = await contract.fullPrice();
    const shardPrice = await contract.shardPrice();
    const saleIsActive = await contract.saleIsActive();
    
    console.log("\nContract Info:");
    console.log(`- Name: ${name}`);
    console.log(`- Symbol: ${symbol}`);
    console.log(`- Full Price: ${ethers.formatEther(fullPrice)} ETH`);
    console.log(`- Shard Price: ${ethers.formatEther(shardPrice)} ETH`);
    console.log(`- Sale Active: ${saleIsActive}`);
    
    // Get supply info
    const supplyInfo = await contract.getSupplyInfo();
    
    console.log("\nSupply Info:");
    console.log(`- Max Full Supply: ${supplyInfo[0]}`);
    console.log(`- Max Shard Supply: ${supplyInfo[1]}`);
    console.log(`- Max Referral Shard Supply: ${supplyInfo[2]}`);
    console.log(`- Max Community Shard Supply: ${supplyInfo[3]}`);
    console.log(`- Minted Full: ${supplyInfo[4]}`);
    console.log(`- Minted Shard: ${supplyInfo[5]}`);
    console.log(`- Minted Referral Shard: ${supplyInfo[6]}`);
    console.log(`- Minted Community Shard: ${supplyInfo[7]}`);
    
    // If you're the owner, you can also test owner functions:
    const owner = await contract.owner();
    console.log(`\nContract owner: ${owner}`);
    console.log(`Current account: ${signer.address}`);
    
    if (owner.toLowerCase() === signer.address.toLowerCase()) {
      console.log("\nYou are the owner. You can test owner functions:");
      
      // Activate sale
      console.log("\nActivating sale...");
      const tx1 = await contract.toggleSaleState();
      await tx1.wait();
      const saleIsActiveNow = await contract.saleIsActive();
      console.log(`- Sale is now active: ${saleIsActiveNow}`);
      
      // Mint a referral shard
      console.log("\nMinting a referral shard to your address...");
      const tx2 = await contract.mintReferralShard(signer.address);
      await tx2.wait();
      
      // Check balances after minting
      const balance = await contract.balanceOf(signer.address);
      console.log(`- Your NFT balance: ${balance}`);
      
      // Check updated supply info
      const updatedSupplyInfo = await contract.getSupplyInfo();
      console.log("\nUpdated Supply Info:");
      console.log(`- Minted Referral Shard: ${updatedSupplyInfo[6]}`);
      
      // Deactivate sale to leave it in original state
      if (saleIsActiveNow) {
        console.log("\nDeactivating sale to return to original state...");
        const tx3 = await contract.toggleSaleState();
        await tx3.wait();
        console.log(`- Sale is active: ${await contract.saleIsActive()}`);
      }
    }
    
    console.log("\nContract test completed successfully!");
    
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
