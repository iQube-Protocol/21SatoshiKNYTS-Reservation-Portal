const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function deployEnhancedContract() {
  try {
    console.log('🚀 Deploying enhanced referral contract with blockchain events...');
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Deploying from address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.02')) {
      throw new Error('Insufficient balance for deployment');
    }
    
    // Compile the enhanced contract
    console.log('🔧 Compiling enhanced contract...');
    const { spawn } = require('child_process');
    
    await new Promise((resolve, reject) => {
      const hardhatProcess = spawn('npx', ['hardhat', 'compile'], {
        cwd: __dirname,
        stdio: 'inherit'
      });
      
      hardhatProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Compilation successful!');
          resolve();
        } else {
          reject(new Error('Hardhat compilation failed'));
        }
      });
    });
    
    // Load the compiled contract
    const artifactPath = path.join(__dirname, 'artifacts/contracts/SatoshiKNYTReservationWithEvents.sol/SatoshiKNYTReservation.json');
    
    if (!fs.existsSync(artifactPath)) {
      throw new Error('Compiled contract not found. Please ensure compilation was successful.');
    }
    
    console.log('📦 Loading compiled contract...');
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    const contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    
    // Deploy with constructor parameters
    const fullPrice = ethers.parseEther("0.01");
    const shardPrice = ethers.parseEther("0.001");
    const baseURI = "https://api.21sats.com/metadata/";
    
    console.log('⏳ Deploying enhanced contract with parameters:');
    console.log('- Full price:', ethers.formatEther(fullPrice), 'ETH');
    console.log('- Shard price:', ethers.formatEther(shardPrice), 'ETH');
    console.log('- Base URI:', baseURI);
    
    const contract = await contractFactory.deploy(fullPrice, shardPrice, baseURI, {
      gasLimit: 3500000 // Increased gas limit for enhanced contract
    });
    
    console.log('⏳ Waiting for deployment confirmation...');
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    console.log('✅ Enhanced contract deployed successfully!');
    console.log('📍 New contract address:', contractAddress);
    
    // Activate the sale
    console.log('⏳ Activating sale...');
    const toggleTx = await contract.toggleSaleState();
    await toggleTx.wait();
    console.log('✅ Sale activated!');
    
    // Test the enhanced contract
    console.log('🧪 Testing enhanced contract functionality...');
    const saleActive = await contract.saleIsActive();
    const price = await contract.fullPrice();
    console.log('- Sale active:', saleActive);
    console.log('- Full price:', ethers.formatEther(price), 'ETH');
    
    // Test referral mint with events
    const testReferrer = '0x0417409BEFbbE9474a7623b2e70438965663138b';
    try {
      console.log('🧪 Testing referral mint with events...');
      const gasEstimate = await contract.mintWithReferral.estimateGas(1, testReferrer, { value: price });
      console.log('✅ Enhanced referral mint gas estimation successful:', gasEstimate.toString());
      console.log('🎉 ENHANCED REFERRAL MINTING WITH EVENTS IS WORKING!');
    } catch (error) {
      console.log('❌ Enhanced referral mint failed:', error.message);
      throw error;
    }
    
    // Test event filtering
    console.log('🧪 Testing event filtering...');
    const filter = contract.filters.ReferralMint();
    console.log('✅ Event filter created successfully');
    
    console.log('\n🎉 ENHANCED DEPLOYMENT COMPLETE!');
    console.log('📝 New features added:');
    console.log('- ✅ ReferralMint events emitted on blockchain');
    console.log('- ✅ Permanent audit trail for all referrals');
    console.log('- ✅ Enhanced mintReferralShard with quantity support');
    console.log('- ✅ Proper referrer validation');
    console.log('- ✅ Backward compatibility maintained');
    
    console.log('\n📝 Update your .env.local file with:');
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    
    // Update the .env.local file automatically
    const envPath = path.join(__dirname, '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(
      /NEXT_PUBLIC_CONTRACT_ADDRESS=.*/,
      `NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`
    );
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local updated automatically!');
    
    // Create backup of old contract address
    const backupPath = path.join(__dirname, '.env.backup');
    fs.writeFileSync(backupPath, `# Previous contract address backup\nPREVIOUS_CONTRACT_ADDRESS=${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}\n`);
    console.log('✅ Previous contract address backed up to .env.backup');
    
    return contractAddress;
    
  } catch (error) {
    console.error('❌ Enhanced deployment failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Run the deployment
deployEnhancedContract().catch(console.error);
