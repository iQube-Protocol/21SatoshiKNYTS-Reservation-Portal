// Verify contract compilation includes all expected functions
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Verifying contract compilation...");
  
  try {
    // Get the contract factory
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservation");
    
    console.log("📋 Contract ABI functions:");
    const abi = Contract.interface;
    
    // List all functions in the ABI
    const functions = abi.fragments.filter(f => f.type === 'function');
    functions.forEach(func => {
      console.log(`  - ${func.name}(${func.inputs.map(i => i.type).join(', ')})`);
    });
    
    // Check for specific referral functions
    const requiredFunctions = [
      'getReferralStats',
      'canReceiveReferralReward',
      'mintFull'
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
    
    // Check mintFull overloads
    const mintFullFunctions = functions.filter(f => f.name === 'mintFull');
    console.log(`\n📋 mintFull overloads found: ${mintFullFunctions.length}`);
    mintFullFunctions.forEach((func, index) => {
      console.log(`  ${index + 1}. mintFull(${func.inputs.map(i => i.type).join(', ')})`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);
