# Qrypto Reservation Portal

This is the reservation portal for the 21 Sats Project, allowing users to mint ERC-721 NFTs that will later be swapped to Bitcoin Ordinals/BRC-721.

## Features

- Dual-pass system (Full SatKNYT and Shard Passes)
- Web3 wallet integration via RainbowKit
- Real-time supply tracking
- Referral system
- Responsive design with dark theme
- Cross-chain migration capability

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your environment variables:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
NEXT_PUBLIC_ALCHEMY_API_KEY=YOUR_ALCHEMY_API_KEY
NEXT_PUBLIC_INFURA_ID=YOUR_INFURA_ID
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Requirements

- Node.js 16+
- Ethereum wallet (MetaMask recommended)
- Alchemy or Infura API key
- Contract address for the Qrypto Reservation Pass smart contract

## License

MIT
