# Qrypto Reservation Portal

This is the reservation portal for the 21 Sats Project, allowing users to mint ERC-721 NFTs that will later be swapped to Bitcoin Ordinals/BRC-721.

## Branch Strategy

This repository uses the following branch strategy:

- **`staging`**: Stable version with fully restored owner panel functionality. This branch should be considered the production-ready code.
- **`dev`**: Development branch for ongoing work and new features. All new development should happen here to avoid risking the stable version.

When features in the `dev` branch are fully tested and ready for production, they can be merged into the `staging` branch.

## Recent Updates (v2.2.0 - PRODUCTION READY)

- ✅ **COMPLETE SOLUTION**: Fixed sale status display by adding contract.saleIsActive() check
- ✅ **STABLE IMPORT**: Replaced flashing prompt with stable modal dialog for paste import
- ✅ **CROSS-BROWSER SYNC**: Verified working clipboard-based referral data transfer
- ✅ **SURGICAL FIXES**: Added sale status without breaking any existing functionality
- ✅ **ENHANCED UX**: Modal dialog with large textarea for reliable data pasting
- ✅ **FULL COMPATIBILITY**: Both Chromium and Brave browsers fully synchronized
- ✅ **PRODUCTION READY**: All core features tested and working reliably

### Previous Updates (v2.1.0)
- ✅ Implemented clipboard-based referral data export/import system
- ✅ Streamlined Owner Actions interface with 6 essential buttons
- ✅ Fixed cross-browser compatibility issues with localStorage isolation
- ✅ Optimized button layout with consistent 220px width and 2-per-row design
- ✅ Removed complex file-based export/import in favor of reliable clipboard transfer
- ✅ Enhanced error handling and user feedback for all operations

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
