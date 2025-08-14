// Analyze V2 contract compilation
require('dotenv').config();
const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Analyzing V2 contract compilation...");
  
  try {
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservationV2");
    
    console.log("📋 Contract ABI Analysis:");
    const abi = Contract.interface;
    
    const functions = abi.fragments.filter(f => f.type === 'function');
    console.log(`Total functions found: ${functions.length}\n`);
    
    console.log("📋 All functions in compiled contract:");
    functions.forEach((func, index) => {
      console.log(`  ${index + 1}. ${func.name}(${func.inputs.map(i => i.type).join(', ')})`);
    });
    
    // Check for specific referral functions
    const requiredFunctions = [
      'getReferralStats',
      'canReceiveReferralReward', 
      'getReferredUsers',
      'mintFullWithReferrer'
    ];
    
    console.log("\n🔍 Checking for referral functions:");
    requiredFunctions.forEach(funcName => {
      const found = functions.find(f => f.name === funcName);
      if (found) {
        console.log(`  ✅ ${funcName} found`);
      } else {
        console.log(`  ❌ ${funcName} missing`);
      }
    });
    
    // Check mintFull overloads
    const mintFullFunctions = functions.filter(f => f.name.includes('mintFull'));
    console.log(`\n📋 mintFull related functions found: ${mintFullFunctions.length}`);
    mintFullFunctions.forEach((func, index) => {
      console.log(`  ${index + 1}. ${func.name}(${func.inputs.map(i => i.type).join(', ')})`);
    });
    
    console.log("\n✅ V2 Contract analysis complete!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main().catch(console.error);
