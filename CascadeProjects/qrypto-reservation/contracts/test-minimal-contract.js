// Test minimal contract compilation
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Testing minimal contract...");
  
  try {
    const Contract = await ethers.getContractFactory("TestMinimal");
    
    console.log("📋 TestMinimal ABI functions:");
    const abi = Contract.interface;
    
    const functions = abi.fragments.filter(f => f.type === 'function');
    functions.forEach(func => {
      console.log(`  - ${func.name}(${func.inputs.map(i => i.type).join(', ')})`);
    });
    
    // Check for specific referral functions
    const requiredFunctions = [
      'getReferralStats',
      'canReceiveReferralReward',
      'getReferredUsers'
    ];
    
    console.log("\n🔍 Checking for required functions:");
    requiredFunctions.forEach(funcName => {
      const found = functions.find(f => f.name === funcName);
      if (found) {
        console.log(`  ✅ ${funcName} found`);
      } else {
        console.log(`  ❌ ${funcName} missing`);
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);
