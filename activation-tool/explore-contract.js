// Script to explore contract functions
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
  const contractAddress = '0x02C7bf349bcC667Cb1c8024ED143309592d998a4';
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error("Private key not found in .env file");
    return;
  }
  
  const cleanedKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
  const wallet = new ethers.Wallet(cleanedKey, provider);
  console.log('Your wallet address:', wallet.address);
  
  // Check basic contract info
  try {
    const contractCode = await provider.getCode(contractAddress);
    console.log('Contract exists:', contractCode !== '0x');
    console.log('Contract code length:', contractCode.length);
    
    // Try with a minimal ABI to check if sale is active
    const minimalAbi = [
      'function saleIsActive() view returns (bool)'
    ];
    
    const contract = new ethers.Contract(contractAddress, minimalAbi, provider);
    try {
      const isActive = await contract.saleIsActive();
      console.log('Sale is active:', isActive);
    } catch (error) {
      console.error('Error checking if sale is active:', error.message);
    }
    
    console.log('\nPlease check the contract on Etherscan to find the correct function:');
    console.log('https://sepolia.etherscan.io/address/0x02C7bf349bcC667Cb1c8024ED143309592d998a4#code');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main().catch(console.error);
