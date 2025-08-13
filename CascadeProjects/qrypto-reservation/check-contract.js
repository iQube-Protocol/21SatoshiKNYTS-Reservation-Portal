require('dotenv').config();
const { ethers } = require('ethers');

// Contract address on Sepolia
const CONTRACT_ADDRESS = '0x02C7bf349bcC667Cb1c8024ED143309592d998a4';

// Minimal ABI for the functions we need
const CONTRACT_ABI = [
  "function getSupplyInfo() view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
  "function saleIsActive() view returns (bool)"
];

async function main() {
  try {
    // Connect to the Sepolia network
    const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_SEPOLIA_URL);
    
    // Get network details
    const network = await provider.getNetwork();
    console.log('Connected to network:', {
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber: await provider.getBlockNumber()
    });
    
    // Create contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // Check if sale is active
    const saleActive = await contract.saleIsActive();
    console.log(`Sale is currently: ${saleActive ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
    
    // Get supply info
    const supplyInfo = await contract.getSupplyInfo();
    
    // Parse and display the supply information
    const supply = {
      maxFullSupply: Number(supplyInfo[0]),
      maxShardSupply: Number(supplyInfo[1]),
      maxReferralShardSupply: Number(supplyInfo[2]),
      maxCommunityShardSupply: Number(supplyInfo[3]),
      mintedFull: Number(supplyInfo[4]),
      mintedShard: Number(supplyInfo[5]),
      mintedReferralShard: Number(supplyInfo[6]),
      mintedCommunityShard: Number(supplyInfo[7]),
    };
    
    console.log('\nCONTRACT SUPPLY INFORMATION:');
    console.log('---------------------------');
    console.log('Full NFTs:');
    console.log(`  Total supply: ${supply.maxFullSupply}`);
    console.log(`  Minted: ${supply.mintedFull}`);
    console.log(`  Available: ${supply.maxFullSupply - supply.mintedFull}`);
    
    console.log('\nDirect Sale Shards:');
    console.log(`  Total supply: ${supply.maxShardSupply}`);
    console.log(`  Minted: ${supply.mintedShard}`);
    console.log(`  Available: ${supply.maxShardSupply - supply.mintedShard}`);
    
    console.log('\nReferral Shards:');
    console.log(`  Total supply: ${supply.maxReferralShardSupply}`);
    console.log(`  Minted: ${supply.mintedReferralShard}`);
    console.log(`  Available: ${supply.maxReferralShardSupply - supply.mintedReferralShard}`);
    
    console.log('\nCommunity Shards:');
    console.log(`  Total supply: ${supply.maxCommunityShardSupply}`);
    console.log(`  Minted: ${supply.mintedCommunityShard}`);
    console.log(`  Available: ${supply.maxCommunityShardSupply - supply.mintedCommunityShard}`);
    
    console.log('\nTotal Shards (All Categories):');
    const totalShardSupply = supply.maxShardSupply + supply.maxReferralShardSupply + supply.maxCommunityShardSupply;
    const totalMintedShards = supply.mintedShard + supply.mintedReferralShard + supply.mintedCommunityShard;
    console.log(`  Total supply: ${totalShardSupply}`);
    console.log(`  Minted: ${totalMintedShards}`);
    console.log(`  Available: ${totalShardSupply - totalMintedShards}`);
    
  } catch (error) {
    console.error('Error checking contract:', error);
  }
}

// Run the script
main();
