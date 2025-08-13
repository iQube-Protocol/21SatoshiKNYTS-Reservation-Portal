// Script to check contract functions
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
  const contractAddress = '0x02C7bf349bcC667Cb1c8024ED143309592d998a4';
  
  // Check contract interface directly
  try {
    const contractCode = await provider.getCode(contractAddress);
    console.log('Contract exists:', contractCode !== '0x');
    
    // Attempt to detect all common sale-related functions
    const functionsToCheck = [
      'setSaleState(bool)',
      'flipSaleState()',
      'setMintActive(bool)',
      'toggleSaleState()',
      'startSale()',
      'pauseSale()',
      'unpauseSale()',
      'activate()',
      'deactivate()',
      'saleIsActive()'
    ];
    
    console.log('
Checking for common sale functions...');
    for (const funcSig of functionsToCheck) {
      const funcSelector = ethers.keccak256(ethers.toUtf8Bytes(funcSig)).slice(0, 10);
      console.log();
    }
    
    console.log('
Please check the contract verified source code on Etherscan to find the correct function.');
    console.log('https://sepolia.etherscan.io/address/0x02C7bf349bcC667Cb1c8024ED143309592d998a4#code');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);
