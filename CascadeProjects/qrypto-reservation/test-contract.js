require('dotenv').config();
const { ethers } = require('ethers');

async function testContract() {
  try {
    console.log('🔍 Testing contract existence...');
    const contractAddress = '0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638';
    console.log('Contract Address:', contractAddress);
    
    // Connect to Sepolia with timeout
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'D_1rqwBg6ZqNws1db5Rvg';
    console.log('Using API key:', apiKey ? 'Found' : 'Missing');
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${apiKey}`);
    
    // Test 1: Check if address has code
    console.log('\n📋 Step 1: Checking if address has contract code...');
    const code = await provider.getCode(contractAddress);
    console.log('Contract code length:', code.length);
    
    if (code === '0x') {
      console.log('❌ No contract deployed at this address!');
      return;
    }
    
    console.log('✅ Contract exists at address');
    
    // Test 2: Try to get block number (network connectivity)
    console.log('\n📋 Step 2: Testing network connectivity...');
    const blockNumber = await provider.getBlockNumber();
    console.log('Current block number:', blockNumber);
    
    // Test 3: Try basic contract call
    console.log('\n📋 Step 3: Testing basic contract call...');
    const abi = ['function saleIsActive() view returns (bool)'];
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    const saleActive = await contract.saleIsActive();
    console.log('Sale is active:', saleActive);
    
    console.log('\n✅ Basic contract interaction successful!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
  }
}

testContract();
