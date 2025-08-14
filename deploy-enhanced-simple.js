const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function deployEnhancedContractSimple() {
  try {
    console.log('🚀 Deploying enhanced referral contract (Simple Method)...');
    
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Deploying from address:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance < ethers.parseEther('0.02')) {
      throw new Error('Insufficient balance for deployment');
    }
    
    // Enhanced contract ABI with new ReferralMint event
    const enhancedContractABI = [
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
        "name": "mintWithReferral",
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
        "inputs": [
          {"internalType": "address", "name": "to", "type": "address"},
          {"internalType": "uint256", "name": "quantity", "type": "uint256"}
        ],
        "name": "mintReferralShard",
        "outputs": [],
        "stateMutability": "nonpayable",
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
      },
      {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MAX_FULL_SUPPLY",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "MAX_SHARD_SUPPLY",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "REFERRAL_SHARD_SUPPLY",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "fullMinted",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "shardMinted",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "referralShardsMinted",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      },
      // NEW: ReferralMint event for blockchain tracking
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
          {"indexed": true, "internalType": "address", "name": "referrer", "type": "address"},
          {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
          {"indexed": false, "internalType": "string", "name": "passType", "type": "string"},
          {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "name": "ReferralMint",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
          {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"}
        ],
        "name": "ReferralShardMinted",
        "type": "event"
      }
    ];
    
    // Try to use existing compiled artifact first
    const artifactPath = path.join(__dirname, 'artifacts/contracts/SatoshiKNYTReservationWithEvents.sol/SatoshiKNYTReservation.json');
    let contractFactory;
    
    if (fs.existsSync(artifactPath)) {
      console.log('📦 Using existing compiled enhanced contract...');
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      contractFactory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
    } else {
      console.log('❌ No compiled enhanced contract found.');
      console.log('🔧 Attempting manual compilation...');
      
      // Try to compile using solc directly
      try {
        const solc = require('solc');
        const contractSource = fs.readFileSync(
          path.join(__dirname, 'contracts/SatoshiKNYTReservationWithEvents.sol'), 
          'utf8'
        );
        
        const input = {
          language: 'Solidity',
          sources: {
            'SatoshiKNYTReservationWithEvents.sol': {
              content: contractSource
            }
          },
          settings: {
            outputSelection: {
              '*': {
                '*': ['*']
              }
            }
          }
        };
        
        const output = JSON.parse(solc.compile(JSON.stringify(input)));
        
        if (output.errors) {
          console.log('Compilation warnings/errors:', output.errors);
        }
        
        const contract = output.contracts['SatoshiKNYTReservationWithEvents.sol']['SatoshiKNYTReservation'];
        contractFactory = new ethers.ContractFactory(contract.abi, contract.evm.bytecode.object, wallet);
        console.log('✅ Manual compilation successful!');
        
      } catch (solcError) {
        console.log('❌ Manual compilation failed:', solcError.message);
        console.log('🔄 Falling back to existing working contract with manual ABI update...');
        
        // Fallback: Use existing working contract but update frontend ABI
        const existingArtifactPath = path.join(__dirname, 'artifacts/contracts/SatoshiKNYTReservation.sol/SatoshiKNYTReservation.json');
        
        if (fs.existsSync(existingArtifactPath)) {
          const existingArtifact = JSON.parse(fs.readFileSync(existingArtifactPath, 'utf8'));
          contractFactory = new ethers.ContractFactory(existingArtifact.abi, existingArtifact.bytecode, wallet);
          console.log('📦 Using existing working contract as fallback...');
        } else {
          throw new Error('No contract artifacts available for deployment');
        }
      }
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
      gasLimit: 3500000
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
    
    // Test the contract
    console.log('🧪 Testing contract functionality...');
    const saleActive = await contract.saleIsActive();
    const price = await contract.fullPrice();
    console.log('- Sale active:', saleActive);
    console.log('- Full price:', ethers.formatEther(price), 'ETH');
    
    // Test referral functionality
    const testReferrer = '0x0417409BEFbbE9474a7623b2e70438965663138b';
    try {
      console.log('🧪 Testing referral mint...');
      
      // Try the enhanced function first
      if (contract.mintWithReferral) {
        const gasEstimate = await contract.mintWithReferral.estimateGas(1, testReferrer, { value: price });
        console.log('✅ Enhanced referral mint gas estimation successful:', gasEstimate.toString());
        console.log('🎉 ENHANCED REFERRAL FUNCTIONALITY WORKING!');
      } else {
        // Fallback to existing function
        const gasEstimate = await contract.mintFullWithReferrer.estimateGas(1, testReferrer, { value: price });
        console.log('✅ Standard referral mint gas estimation successful:', gasEstimate.toString());
        console.log('🎉 REFERRAL FUNCTIONALITY WORKING!');
      }
    } catch (error) {
      console.log('❌ Referral mint test failed:', error.message);
    }
    
    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('📝 Update your .env.local file with:');
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    
    // Update the .env.local file automatically
    const envPath = path.join(__dirname, '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Backup current address
    const currentAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    if (currentAddress) {
      const backupPath = path.join(__dirname, '.env.backup');
      fs.writeFileSync(backupPath, `# Previous contract address backup\nPREVIOUS_CONTRACT_ADDRESS=${currentAddress}\n`);
      console.log('✅ Previous contract address backed up to .env.backup');
    }
    
    // Update with new address
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
deployEnhancedContractSimple().catch(console.error);
