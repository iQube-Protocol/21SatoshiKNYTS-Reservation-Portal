const { ethers } = require('ethers');

// Environment variables from .env.local
const CONTRACT_ADDRESS = '0x2C10B03304475efE780EE879cF138D2e6bE5c4D5';
const ALCHEMY_KEY = 'D_1rqwBg6ZqNws1db5Rvg';

async function queryBlockchainReferralData() {
  try {
    console.log('🔍 Querying blockchain for referral data...');
    console.log('Contract Address:', CONTRACT_ADDRESS);
    
    // Create provider using Alchemy (ethers v6 syntax)
    const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`);
    
    // Contract ABI for Transfer events
    const abi = [
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
    ];
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
    
    // Query Transfer events from the beginning
    console.log('📊 Querying Transfer events...');
    const events = await contract.queryFilter('Transfer', 0, 'latest');
    
    console.log(`📊 Total Transfer events found: ${events.length}`);
    
    // Filter for mint events (from zero address = new mints)
    const mintEvents = events.filter(event => 
      event.args.from === '0x0000000000000000000000000000000000000000'
    );
    
    console.log(`🔍 Mint events found: ${mintEvents.length}`);
    
    // Get unique minters
    const uniqueMinters = [...new Set(mintEvents.map(event => event.args.to))];
    console.log(`👥 Unique minters: ${uniqueMinters.length}`);
    
    // Analyze each mint event
    console.log('\n📋 DETAILED MINT ANALYSIS:');
    for (let i = 0; i < Math.min(mintEvents.length, 10); i++) {
      const event = mintEvents[i];
      console.log(`${i + 1}. Token ID: ${event.args.tokenId}, To: ${event.args.to}, Block: ${event.blockNumber}, Tx: ${event.transactionHash}`);
    }
    
    // Return the actual blockchain data
    const result = {
      totalTransferEvents: events.length,
      mintEvents: mintEvents.length,
      uniqueMinters: uniqueMinters.length,
      minterAddresses: uniqueMinters,
      contractAddress: CONTRACT_ADDRESS,
      blockchainQuerySuccessful: true,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n✅ BLOCKCHAIN QUERY RESULTS:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ Blockchain query failed:', error.message);
    return {
      error: error.message,
      blockchainQuerySuccessful: false
    };
  }
}

// Run the query
queryBlockchainReferralData();
