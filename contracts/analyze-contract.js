// Detailed analysis of compiled contract
require('dotenv').config();
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🔍 Analyzing compiled contract...");
  
  try {
    // Get the contract factory
    const Contract = await ethers.getContractFactory("SatoshiKNYTReservation");
    
    console.log("📋 Contract ABI Analysis:");
    const abi = Contract.interface;
    
    // Get all functions
    const functions = abi.fragments.filter(f => f.type === 'function');
    console.log(`Total functions found: ${functions.length}`);
    
    // List all functions
    console.log("\n📋 All functions in compiled contract:");
    functions.forEach((func, index) => {
      console.log(`  ${index + 1}. ${func.name}(${func.inputs.map(i => `${i.type} ${i.name}`).join(', ')})`);
    });
    
    // Check for specific referral functions
    const referralFunctions = [
      'getReferralStats',
      'canReceiveReferralReward',
      'getReferredUsers'
    ];
    
    console.log("\n🔍 Checking for referral functions:");
    referralFunctions.forEach(funcName => {
      const found = functions.find(f => f.name === funcName);
      if (found) {
        console.log(`  ✅ ${funcName} found: ${found.format()}`);
      } else {
        console.log(`  ❌ ${funcName} MISSING`);
      }
    });
    
    // Check mintFull overloads
    const mintFullFunctions = functions.filter(f => f.name === 'mintFull');
    console.log(`\n📋 mintFull overloads found: ${mintFullFunctions.length}`);
    mintFullFunctions.forEach((func, index) => {
      console.log(`  ${index + 1}. ${func.format()}`);
    });
    
    // Check the actual contract bytecode
    console.log("\n📋 Contract bytecode analysis:");
    const bytecode = Contract.bytecode;
    console.log(`Bytecode length: ${bytecode.length} characters`);
    
    // Read the compiled artifact directly
    const artifactPath = path.join(__dirname, 'artifacts/contracts/SatoshiKNYTReservation.sol/SatoshiKNYTReservation.json');
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      console.log(`\n📋 Artifact analysis:`);
      console.log(`Contract name: ${artifact.contractName}`);
      console.log(`Source name: ${artifact.sourceName}`);
      console.log(`ABI entries: ${artifact.abi.length}`);
      
      // Check if referral functions are in the ABI
      const abiReferralFunctions = artifact.abi.filter(item => 
        item.type === 'function' && referralFunctions.includes(item.name)
      );
      console.log(`Referral functions in ABI: ${abiReferralFunctions.length}`);
      abiReferralFunctions.forEach(func => {
        console.log(`  - ${func.name}`);
      });
    } else {
      console.log("❌ Artifact file not found");
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

main().catch(console.error);
