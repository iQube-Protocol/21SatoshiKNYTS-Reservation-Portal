const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function main() {
  try {
    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Check balance
    const balance = await provider.getBalance(signer.address);
    console.log(`Deploying from address: ${signer.address}`);
    console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

    // Read and compile contract
    const contractSource = fs.readFileSync(path.join(__dirname, '../contracts/SatoshiKNYTReservation.sol'), 'utf8');
    console.log('Contract source loaded successfully');
    
    // For now, we'll use a simple deployment approach
    // In production, you'd want to use Hardhat or similar for compilation
    
    // Parameters for deployment
    const fullPrice = ethers.parseEther("0.01"); // 0.01 ETH per full Satoshi KNYT (testnet price)
    const shardPrice = ethers.parseEther("0.001"); // 0.001 ETH per Satoshi KNYT Shard (testnet price)
    const baseURI = "https://api.21sats.com/metadata/";

    console.log("Deploying 21 Sats Reservation Contract with parameters:");
    console.log(`Full Satoshi KNYT price: ${ethers.formatEther(fullPrice)} ETH`);
    console.log(`Satoshi KNYT Shard price: ${ethers.formatEther(shardPrice)} ETH`);
    console.log(`Base URI: ${baseURI}`);
    console.log(`Supply structure:`);
    console.log(`- 18 Full Satoshi KNYTs for sale`);
    console.log(`- 21 Satoshi KNYT Shards for direct sale`);
    console.log(`- 18 Satoshi KNYT Shards for referral rewards`);
    console.log(`- 3 Satoshi KNYT Shards for community/prizes`);

    console.log("Starting deployment...");
    const contract = await SatoshiKNYTReservation.deploy(
      fullPrice,
      shardPrice,
      baseURI
    );

    console.log(`Deploy transaction hash: ${contract.deploymentTransaction().hash}`);
    console.log("Waiting for deployment...");

    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();
    console.log("Contract deployed successfully!");
    console.log("Contract address:", contractAddress);
    console.log("\n=== DEPLOYMENT SUMMARY ===");
    console.log(`Contract Name: 21 Sats Reservation Contract`);
    console.log(`Contract Address: ${contractAddress}`);
    console.log(`Network: Sepolia Testnet`);
    console.log(`Transaction Hash: ${contract.deploymentTransaction().hash}`);

  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
