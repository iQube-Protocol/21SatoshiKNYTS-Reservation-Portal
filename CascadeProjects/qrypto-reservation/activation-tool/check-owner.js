// Script to check contract owner
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
  const contractAddress = '0x02C7bf349bcC667Cb1c8024ED143309592d998a4';
  const privateKey = process.env.PRIVATE_KEY;
  const cleanedKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
  const wallet = new ethers.Wallet(cleanedKey, provider);
  console.log('Your wallet address:', wallet.address);
  
  // Check if our wallet address matches the owner
  const abi = [
    'function owner() view returns (address)',
    'function functions() view returns (string[])',
  ];
  
  try {
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const owner = await contract.owner();
    console.log('Contract owner:', owner);
    console.log('Is your wallet the owner?', wallet.address.toLowerCase() === owner.toLowerCase());
  } catch (error) {
    console.error('Error getting contract owner:', error.message);
  }
}

main().catch(console.error);
