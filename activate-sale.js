const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const CONTRACT_ADDRESS = '0x357b561CbE6065B717AC0f334BE75500883860fc';
const ALCHEMY_API_KEY = 'D_1rqwBg6ZqNws1db5Rvg';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const KNYT_CONTRACT_ABI = [
  'function toggleSaleState() external',
  'function openReferralShardsForSale() external',
  'function saleIsActive() external view returns (bool)',
  'function referralShardsCanBeSold() external view returns (bool)',
  'function owner() external view returns (address)'
];

async function activateSale() {
  try {
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, KNYT_CONTRACT_ABI, wallet);
    
    console.log('=== ACTIVATING SALE AND REFERRAL SYSTEM ===');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log('From wallet:', wallet.address);
    
    // Check current states
    const [currentSaleState, currentReferralState] = await Promise.all([
      contract.saleIsActive(),
      contract.referralShardsCanBeSold()
    ]);
    
    console.log('Current sale state:', currentSaleState);
    console.log('Current referral shards state:', currentReferralState);
    
    // Activate sale if needed
    if (!currentSaleState) {
      console.log('\n🔄 Activating sale...');
      const saleTx = await contract.toggleSaleState();
      console.log('Sale transaction hash:', saleTx.hash);
      
      console.log('Waiting for sale activation...');
      await saleTx.wait();
      console.log('✅ Sale activated!');
    } else {
      console.log('✅ Sale is already active!');
    }
    
    // Activate referral shards if needed
    if (!currentReferralState) {
      console.log('\n🔄 Activating referral shards for sale...');
      const referralTx = await contract.openReferralShardsForSale();
      console.log('Referral transaction hash:', referralTx.hash);
      
      console.log('Waiting for referral activation...');
      await referralTx.wait();
      console.log('✅ Referral shards activated!');
    } else {
      console.log('✅ Referral shards are already active!');
    }
    
    // Final state check
    const [finalSaleState, finalReferralState] = await Promise.all([
      contract.saleIsActive(),
      contract.referralShardsCanBeSold()
    ]);
    
    console.log('\n=== FINAL STATUS ===');
    console.log('✅ Sale active:', finalSaleState);
    console.log('✅ Referral shards active:', finalReferralState);
    console.log('\n🎉 Contract is fully activated and ready for minting!');
    
  } catch (error) {
    console.error('❌ Failed to activate sale:', error.message);
  }
}

activateSale();
