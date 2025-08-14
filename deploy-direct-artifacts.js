const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function deployUsingExistingArtifacts() {
  try {
    console.log('🚀 Deploying contract using existing compiled artifacts...');
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Deploying from address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.02')) {
      throw new Error('Insufficient balance for deployment');
    }
    
    // Use existing compiled artifact - this is the key insight from the deployment memory
    const artifactPath = path.join(__dirname, 'contracts/artifacts/contracts/SatoshiKNYTReservation.sol/SatoshiKNYTReservation.json');
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error('Compiled contract artifact not found at: ' + artifactPath);
    }
    
    console.log('📦 Using existing compiled contract artifact...');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    
    // Deploy with constructor parameters (matching the working deployment pattern)
    const fullPrice = ethers.parseEther("0.01");
    const shardPrice = ethers.parseEther("0.001");
    const baseURI = "https://api.21sats.com/metadata/";
    
    console.log('⏳ Deploying contract with parameters:');
    console.log('- Full price:', ethers.formatEther(fullPrice), 'ETH');
    console.log('- Shard price:', ethers.formatEther(shardPrice), 'ETH');
    console.log('- Base URI:', baseURI);
    
    const contract = await contractFactory.deploy(fullPrice, shardPrice, baseURI, {
      gasLimit: 3000000
    });
    
    console.log('⏳ Waiting for deployment confirmation...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Contract deployed successfully!');
    console.log('📍 New contract address:', contractAddress);
    
    // Activate the sale
    console.log('⏳ Activating sale...');
    const toggleTx = await contract.toggleSaleState();
    await toggleTx.wait();
    console.log('✅ Sale activated!');
    
    // Test the new contract
    console.log('🧪 Testing new contract functionality...');
    const saleActive = await contract.saleIsActive();
    const price = await contract.fullPrice();
    console.log('- Sale active:', saleActive);
    console.log('- Full price:', ethers.formatEther(price), 'ETH');
    
    // Test referral mint with the new contract
    const testReferrer = '0x0417409BEFbbE9474a7623b2e70438965663138b';
    try {
      console.log('🧪 Testing referral mint gas estimation...');
      const gasEstimate = await contract.mintFullWithReferrer.estimateGas(1, testReferrer, { value: price });
      console.log('✅ Referral mint gas estimation successful:', gasEstimate.toString());
      console.log('🎉 REFERRAL MINTING IS WORKING!');
    } catch (error) {
      console.log('❌ Referral mint test failed:', error.message);
    }
    
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('📝 Update your .env.local file with:');
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    
    // Backup current contract address
    const currentAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (currentAddress) {
      const backupPath = path.join(__dirname, '.env.backup');
      fs.writeFileSync(backupPath, `# Previous contract address backup\nPREVIOUS_CONTRACT_ADDRESS=${currentAddress}\n`);
      console.log('✅ Previous contract address backed up to .env.backup');
    }
    
    // Update the .env.local file automatically
    const envPath = path.join(__dirname, '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated automatically!');
    
    return contractAddress;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Run the deployment
deployUsingExistingArtifacts().catch(console.error);
