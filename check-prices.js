require('dotenv').config();
const { ethers } = require('ethers');

async function checkPrices() {
  try {
    console.log('🔍 Checking deployed contract prices...');
    console.log('Contract: 0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638');
    
    // Connect to Sepolia
    const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || 'D_1rqwBg6ZqNws1db5Rvg';
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${apiKey}`);
    
    // Simple ABI for price functions
    const abi = [
      'function fullPrice() view returns (uint256)',
      'function shardPrice() view returns (uint256)',
      'function saleIsActive() view returns (bool)'
    ];
    
    const contract = new ethers.Contract('0x1991209FcafBf96C29a4d1ec0299E77a2Af2A638', abi, provider);
    
    console.log('\n📊 Reading contract state...');
    
    const fullPrice = await contract.fullPrice();
    const shardPrice = await contract.shardPrice();
    const saleActive = await contract.saleIsActive();
    
    console.log('\n✅ Contract Prices:');
    console.log(`Full Price: ${ethers.formatEther(fullPrice)} ETH (${fullPrice.toString()} wei)`);
    console.log(`Shard Price: ${ethers.formatEther(shardPrice)} ETH (${shardPrice.toString()} wei)`);
    console.log(`Sale Active: ${saleActive}`);
    
    console.log('\n🔧 Frontend Should Use:');
    console.log(`fullPriceData fallback: ethers.parseEther("${ethers.formatEther(fullPrice)}")`);
    console.log(`shardPriceData fallback: ethers.parseEther("${ethers.formatEther(shardPrice)}")`);
    
  } catch (error) {
    console.error('❌ Error checking prices:', error.message);
    if (error.code === 'CALL_EXCEPTION') {
      console.log('💡 This might mean the contract functions don\'t exist or have different names');
    }
  }
}

checkPrices();
