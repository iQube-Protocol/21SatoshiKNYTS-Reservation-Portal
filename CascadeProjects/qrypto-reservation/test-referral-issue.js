const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const CONTRACT_ADDRESS = '0x357b561CbE6065B717AC0f334BE75500883860fc';
const ALCHEMY_API_KEY = 'D_1rqwBg6ZqNws1db5Rvg';

const KNYT_CONTRACT_ABI = [
  'function mintFullWithReferrer(uint256 quantity, address referrer) external payable',
  'function mintFull(uint256 quantity) external payable',
  'function totalSupply() external view returns (uint256)',
  'function fullPrice() external view returns (uint256)',
  'function saleIsActive() external view returns (bool)',
  'function referralShardsMinted() external view returns (uint256)',
  'function REFERRAL_SHARD_SUPPLY() external view returns (uint256)'
];

async function testReferralIssue() {
  try {
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, KNYT_CONTRACT_ABI, provider);
    
    console.log('=== REFERRAL ISSUE ANALYSIS ===');
    
    const totalSupply = await contract.totalSupply();
    const referralShards = await contract.referralShardsMinted();
    const maxReferralShards = await contract.REFERRAL_SHARD_SUPPLY();
    const saleActive = await contract.saleIsActive();
    const fullPrice = await contract.fullPrice();
    
    console.log('Current total supply:', totalSupply.toString());
    console.log('Referral shards minted:', referralShards.toString());
    console.log('Max referral shards:', maxReferralShards.toString());
    console.log('Sale active:', saleActive);
    console.log('Full price:', ethers.formatEther(fullPrice), 'ETH');
    
    console.log('\n=== TOKEN ID COLLISION ANALYSIS ===');
    console.log('Next referral token ID would be:', (totalSupply + 1n).toString());
    console.log('Next user token ID would be:', (totalSupply + 1n).toString());
    console.log('❌ COLLISION: Both tokens trying to use same ID!');
    
    console.log('\n=== SOLUTION NEEDED ===');
    console.log('The contract has a bug where referral shard and user token');
    console.log('both try to use totalSupply() + 1 as token ID.');
    console.log('This causes _safeMint() to revert on the second mint.');
    console.log('The contract needs to be fixed to handle token ID sequencing properly.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testReferralIssue();
