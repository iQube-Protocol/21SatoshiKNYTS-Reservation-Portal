require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: './.env.local' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111,
      gas: 5000000,
      gasPrice: 20000000000 // 20 gwei
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
