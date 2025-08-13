const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function deployFixedContract() {
  try {
    console.log('🚀 Deploying fixed referral contract...');
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Deploying from address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.02')) {
      throw new Error('Insufficient balance for deployment');
    }
    
    // Read the Solidity contract source
    const contractPath = path.join(__dirname, 'contracts/SatoshiKNYTReservation.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');
    
    // Simple contract compilation using solc (we'll use a pre-compiled version)
    // For this deployment, I'll use the working contract ABI and bytecode
    
    const contractABI = [
      {
        "inputs": [
          {"internalType": "uint256", "name": "_fullPrice", "type": "uint256"},
          {"internalType": "uint256", "name": "_shardPrice", "type": "uint256"},
          {"internalType": "string", "name": "_baseURI", "type": "string"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "quantity", "type": "uint256"}
        ],
        "name": "mintFull",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {"internalType": "uint256", "name": "quantity", "type": "uint256"},
          {"internalType": "address", "name": "referrer", "type": "address"}
        ],
        "name": "mintFullWithReferrer",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "saleIsActive",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "toggleSaleState",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fullPrice",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    // This is a simplified approach - in production you'd compile with solc
    // For now, let's try to use Hardhat's compilation artifacts if they exist
    const artifactPath = path.join(__dirname, 'artifacts/contracts/SatoshiKNYTReservation.sol/SatoshiKNYTReservation.json');
    
    let contractFactory;
    
    if (fs.existsSync(artifactPath)) {
      console.log('📦 Using existing compiled contract...');
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    } else {
      console.log('❌ No compiled contract found. Need to compile first.');
      console.log('🔧 Attempting to compile with Hardhat...');
      
      // Try to compile using Hardhat programmatically
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const hardhatProcess = spawn('npx', ['hardhat', 'compile'], {
          cwd: __dirname,
          stdio: 'inherit'
        });
        
        hardhatProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Compilation successful, retrying deployment...');
            deployFixedContract().then(resolve).catch(reject);
          } else {
            reject(new Error('Hardhat compilation failed'));
          }
        });
      });
    }
    
    // Deploy with constructor parameters
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
      console.log('🎉 REFERRAL MINTING IS NOW WORKING!');
    } catch (error) {
      console.log('❌ Referral mint still failing:', error.message);
      console.log('This suggests the issue is in the contract logic itself.');
    }
    
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('📝 Update your .env.local file with:');
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
    
    return contractAddress;
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

// Run the deployment
deployFixedContract().catch(console.error);
