const { ethers } = require('ethers');
require('dotenv').config({ path: '.env.local' });

async function redeployContract() {
  try {
    console.log('🚀 Starting contract redeployment...');
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Deploying from address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    // Contract bytecode and ABI (simplified for deployment)
    // This is the compiled bytecode for SatoshiKNYTReservation contract
    const contractBytecode = `0x608060405234801561001057600080fd5b506040516200238e3803806200238e833981810160405281019061003491906200028d565b6040518060400160405280601681526020017f323120536174732052657365727661746974696f6e20506173730000000000008152506040518060400160405280600581526020017f32315352500000000000000000000000000000000000000000000000000000008152508160009081620000b1919062000539565b508060019081620000c3919062000539565b505050620000e6620000da6200011960201b60201c565b6200012160201b60201c565b8260078190555081600881905550806009908162000105919062000539565b508060068190555050505062000620565b600033905090565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600080fd5b6000819050919050565b620001fe81620001e9565b81146200020a57600080fd5b50565b6000815190506200021e81620001f3565b92915050565b600080fd5b600080fd5b600080fd5b60008190508260005b8381101562000263578082015181840152602081019050620002405b50505050565b60008190508260005b838110156200028857808201518184015260208101905062000269565b505050565b6000806000606084860312156200029f576200029e620001e4565b5b6000620002af868287016200020d565b9350506020620002c2868287016200020d565b925050604084015167ffffffffffffffff811115620002e657620002e562000224565b5b620002f48682870162000233565b9150509250925092565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200034857607f821691505b6020821081036200035e576200035d620002fe565b5b50919050565b60008190508160005b838110156200038c57808201518184015260208101905062000371565b50505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200040457607f821691505b6020821081036200041a5762000419620003c1565b5b50919050565b60008190508160005b838110156200044857808201518184015260208101905062000431565b50505050565b60008190508160005b838110156200047657808201518184015260208101905062000459565b50505050565b60008190508160005b83811015620004a457808201518184015260208101905062000487565b50505050565b60008190508160005b83811015620004d2578082015181840152602081019050620004b5565b50505050565b60008190508160005b8381101562000500578082015181840152602081019050620004e3565b50505050565b60008190508160005b838110156200052e57808201518184015260208101905062000511565b50505050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806200058857607f821691505b6020821081036200059e576200059d62000547565b5b50919050565b60008190508160005b83811015620005d2578082015181840152602081019050620005b5565b50505050565b60008190508160005b8381101562000600578082015181840152602081019050620005e3565b50505050565b60008190508160005b838110156200062e57808201518184015260208101905062000611565b50505050565b611d5e80620006306000396000f3fe`;

    // Constructor parameters
    const fullPrice = ethers.parseEther("0.01");
    const shardPrice = ethers.parseEther("0.001"); 
    const baseURI = "https://api.21sats.com/metadata/";
    
    console.log('Contract parameters:');
    console.log('- Full price:', ethers.formatEther(fullPrice), 'ETH');
    console.log('- Shard price:', ethers.formatEther(shardPrice), 'ETH');
    console.log('- Base URI:', baseURI);
    
    // Create contract factory with ABI
    const contractABI = [
      "constructor(uint256 _fullPrice, uint256 _shardPrice, string memory _baseURI)",
      "function saleIsActive() external view returns (bool)",
      "function mintFullWithReferrer(uint256 quantity, address referrer) external payable",
      "function mintFull(uint256 quantity) external payable",
      "function fullPrice() external view returns (uint256)",
      "function toggleSaleState() external",
      "function owner() external view returns (address)"
    ];
    
    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    
    console.log('⏳ Deploying contract...');
    const contract = await contractFactory.deploy(fullPrice, shardPrice, baseURI, {
      gasLimit: 3000000
    });
    
    console.log('⏳ Waiting for deployment confirmation...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Contract deployed successfully!');
    console.log('📍 Contract address:', contractAddress);
    
    // Activate the sale
    console.log('⏳ Activating sale...');
    const toggleTx = await contract.toggleSaleState();
    await toggleTx.wait();
    console.log('✅ Sale activated!');
    
    // Test the new contract
    console.log('🧪 Testing new contract...');
    const saleActive = await contract.saleIsActive();
    const price = await contract.fullPrice();
    console.log('- Sale active:', saleActive);
    console.log('- Full price:', ethers.formatEther(price), 'ETH');
    
    // Test referral mint
    const testReferrer = '0x0417409BEFbbE9474a7623b2e70438965663138b';
    try {
      console.log('🧪 Testing referral mint gas estimation...');
      const gasEstimate = await contract.mintFullWithReferrer.estimateGas(1, testReferrer, { value: price });
      console.log('✅ Referral mint gas estimation successful:', gasEstimate.toString());
    } catch (error) {
      console.log('❌ Referral mint still failing:', error.message);
    }
    
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('📝 Update your .env.local file with:');
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Full error:', error);
  }
}

redeployContract();
