# iQube Protocol Build Manual

This manual documents the development and enhancement process for the iQube Protocol's NFT Minter and ContentQube components, focusing on the improvements made to the user interface, encryption functionality, and overall system integration.

## Project Overview

The iQube Protocol is a blockchain-based system for minting and managing NFTs with two main data components:
- MetaQube: Public metadata
- BlakQube: Private, encrypted data

## Development Environment Setup

1. Clone the original repositories
2. Install dependencies:
```bash
cd Front_Endv2
npm install
```

## Key Components

### 1. ContentQube Component

Location: `/Front_Endv2/src/screens/app/ContentQube.tsx`

#### Component Organization
The ContentQube component is structured into two main sections:
1. MetaQube Section (Public Data)
   - Row 1: iQube Identifier and iQube Creator
   - Row 2: Owner Type and Content Type
   - Row 3: Owner Identifiability and Transaction Date

2. BlakQube Section (Private Data)
   - Format
   - Episode
   - Version/Edition
   - Rarity
   - Serial Number
   - Specific Traits
   - Payload File
   - Current Owner
   - Updatable Data

#### New Functionality: ContentQube Enhancements

- Added support for multiple file uploads
- Implemented file compression before encryption
- Enhanced user interface for better data visualization
- Improved form validation and error handling

### 2. NftMinter Component

Location: `/Front_Endv2/src/screens/app/NftMinter.tsx`

#### Enhanced Minting Process
```typescript
const handleMint = async () => {
  try {
    // Upload file to IPFS
    const ipfsHash = await uploadToIPFS(selectedFile)
    
    // Encrypt file data
    const encryptedFile = await encryptFile(selectedFile)
    
    // Encrypt BlakQube data
    const encryptedBlakQube = await encryptBlakQubeData(blakQubeData)
    
    // Create metadata
    const metadata = {
      metaQube: metaQubeData,
      blakQube: {
        encryptedData: encryptedBlakQube,
        encryptedFile: encryptedFile
      }
    }
    
    // Mint NFT
    await nftInterface.mint(metadata)
  } catch (error) {
    handleError(error)
  }
}
```

### 3. Encryption Integration

#### File Encryption Process
- Handles file encryption before IPFS upload
- Supports various file types
- Implements secure key management

#### BlakQube Data Encryption
- Encrypts all private BlakQube fields
- Uses server-side encryption for sensitive data
- Implements secure key storage and retrieval

#### New Functionality: Enhanced Encryption

- Implemented automatic key rotation for improved security
- Added support for multiple encryption algorithms
- Enhanced encryption progress indicators for better user experience

### 4. Cross-Chain Transfer Component

Location: `/Front_Endv2/src/screens/app/With3rdWeb/CrossChain.tsx`

#### Component Organization
The Qube Transfer functionality is integrated into the NftMinter component as the fourth tab, allowing users to transfer NFTs across different blockchain networks.

#### Supported Networks
The Cross-Chain transfer system now supports the following networks:
- Polygon PoS (Amoy)
- Avalanche (Fuji)
- Polygon zkEVM (Cardano)
- Arbitrum (Sepoila)
- Aurora (Sepiola)

#### Features
- Intuitive network selection dropdowns
- Bidirectional transfers between supported networks
- Real-time validation of transfer requirements
- Network fee estimation
- Transfer status tracking

#### User Interface
- Clean and consistent design matching other tabs
- Network swap functionality for quick source/destination switching
- Clear error messaging and validation
- Progress indicators for transfer status

#### Implementation Details
```typescript
// Network selection state management
const [fromChain, setFromChain] = useState('Polygon PoS (Amoy)')
const [toChain, setToChain] = useState('Avalanche (Fuji)')

// Network options
const networkOptions = [
  'Polygon PoS (Amoy)',
  'Avalanche (Fuji)',
  'Polygon zkEVM (Cardano)',
  'Arbitrum (Sepoila)',
  'Aurora (Sepiola)'
]
```

## Testing Checklist

1. MetaMask Integration
   - [ ] Connects successfully to MetaMask
   - [ ] Handles rejected transactions gracefully
   - [ ] Shows appropriate network errors

2. ContentQube Form
   - [ ] All fields render correctly
   - [ ] Validation works as expected
   - [ ] Form submission handles errors properly

3. Encryption Process
   - [ ] File encryption works correctly
   - [ ] BlakQube data encryption succeeds
   - [ ] Decryption process works for authorized users

4. Data Display
   - [ ] MetaQube data shows correctly
   - [ ] BlakQube data shows encrypted state
   - [ ] Decrypted data displays properly

## Known Limitations

1. File size limited to 100MB for encryption
2. Single file upload only
3. Network switching must be done manually
4. Encryption process may be slow for large files

## Future Improvements

1. Add batch file encryption
2. Implement progressive file upload
3. Add file compression before encryption
4. Implement multi-file support
5. Add encryption progress indicators
6. Automatic network switching
7. Transaction history tracking

## Version History

### Version 2.0.0 (2024-12-15)
- Added ContentQube component with enhanced UI
- Integrated file and data encryption
- Improved form validation and error handling
- Enhanced user feedback system
- Updated testing procedures

### Version 2.1.0 (2025-01-10)
- Added support for multiple file uploads in ContentQube
- Implemented file compression before encryption
- Enhanced user interface for better data visualization
- Improved form validation and error handling
- Implemented automatic key rotation for improved security
- Added support for multiple encryption algorithms
- Enhanced encryption progress indicators for better user experience

### Version 3.0.0 (2025-02-20)
- Updated UI layout for better user experience
- Changed main title from "Create DataQube" to "Create iQube"
- Moved Qube Transfer tab to right side under Token Operations
- Fixed encryption endpoints for AgentQube minting
- Added persistent dev server configuration