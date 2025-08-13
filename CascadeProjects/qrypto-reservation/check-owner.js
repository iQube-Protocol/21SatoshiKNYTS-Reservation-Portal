const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

const CONTRACT_ADDRESS = '0x357b561CbE6065B717AC0f334BE75500883860fc';
const ALCHEMY_API_KEY = 'D_1rqwBg6ZqNws1db5Rvg';

const KNYT_CONTRACT_ABI = [
  'function owner() external view returns (address)',
  'function saleIsActive() external view returns (bool)',
  'function referralShardsCanBeSold() external view returns (bool)'
];

async function checkOwner() {
  try {
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, KNYT_CONTRACT_ABI, provider);
    
    console.log('=== CONTRACT OWNERSHIP CHECK ===');
    console.log('Contract:', CONTRACT_ADDRESS);
    
    const [owner, saleActive, referralActive] = await Promise.all([
      contract.owner(),
      contract.saleIsActive(),
      contract.referralShardsCanBeSold()
    ]);
    
    console.log('Contract owner:', owner);
    console.log('Deployer address:', '0xa88242692608E3e3E207e284fbdd55250AEf9A54');
    console.log('Current wallet:', '0x2c7536E3605D9C16a7a3D7b1898e529396a65c23');
    console.log('Sale active:', saleActive);
    console.log('Referral shards active:', referralActive);
    
    if (owner === '0xa88242692608E3e3E207e284fbdd55250AEf9A54') {
      console.log('✅ Owner matches deployer address');
    } else {
      console.log('❌ Owner does not match deployer address');
    }
    
  } catch (error) {
    console.error('❌ Failed to check owner:', error.message);
  }
}

checkOwner();
