// Sample Express API for NFT metadata
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Constants from the contract
const MAX_FULL_SUPPLY = 18;
const TOTAL_SUPPLY = MAX_FULL_SUPPLY + 42; // 18 full + 42 shards

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Primary metadata endpoint - returns metadata for a token ID
app.get('/metadata/:tokenId', async (req, res) => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    // Validate token ID
    if (isNaN(tokenId) || tokenId <= 0 || tokenId > TOTAL_SUPPLY) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    // Determine if it's a full token or shard
    const isFullToken = tokenId <= MAX_FULL_SUPPLY;
    
    // Create appropriate metadata based on token type
    const metadata = {
      name: isFullToken 
        ? `Satoshi KNYT #${tokenId}` 
        : `Satoshi KNYT Shard #${tokenId - MAX_FULL_SUPPLY}`,
      description: isFullToken
        ? `Full ownership of Satoshi KNYT #${tokenId}, part of the exclusive collection of 21 Satoshi KNYTs.`
        : `Fractional ownership shard of Satoshi KNYT, part of the exclusive collection of 42 Satoshi KNYT Shards.`,
      image: `https://${req.get('host')}/images/${isFullToken ? 'full' : 'shard'}/${tokenId}.png`,
      external_url: `https://21sats.com/token/${tokenId}`,
      attributes: [
        {
          trait_type: "Type",
          value: isFullToken ? "Full" : "Shard"
        }
      ]
    };
    
    // Add type-specific attributes
    if (isFullToken) {
      metadata.attributes.push(
        {
          trait_type: "Edition",
          value: "Genesis"
        },
        {
          trait_type: "Satoshi Number",
          value: tokenId
        }
      );
    } else {
      // For shards, determine the type based on ranges
      // (This is a simplified implementation - you'd want to check against actual minted data)
      const shardNumber = tokenId - MAX_FULL_SUPPLY;
      let shardType = "Sale";
      
      if (shardNumber > 21 && shardNumber <= 39) {
        shardType = "Referral";
      } else if (shardNumber > 39) {
        shardType = "Community";
      }
      
      metadata.attributes.push(
        {
          trait_type: "Shard Type",
          value: shardType
        },
        {
          trait_type: "Parent KNYT",
          value: Math.ceil(shardNumber / 21) + 19  // Mapping logic for parent KNYT
        }
      );
    }
    
    // Return the metadata
    return res.json(metadata);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Contract-level metadata endpoint
app.get('/contract-metadata', (req, res) => {
  const metadata = {
    name: "21 Sats Reservation Pass",
    description: "Reservation system for 21 Satoshi KNYTs with fractional ownership through Satoshi KNYT Shards. Total supply includes 18 full Satoshi KNYTs for direct sale and 42 Satoshi KNYT Shards representing fractional ownership.",
    image: `https://${req.get('host')}/images/logo.png`,
    external_link: "https://21sats.com",
    seller_fee_basis_points: 250, // 2.5% royalty
    fee_recipient: "0xa88242692608E3e3E207e284fbdd55250AEf9A54" // Contract owner address
  };
  
  return res.json(metadata);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Metadata API server running on port ${PORT}`);
  console.log(`Base URL: http://localhost:${PORT}`);
  console.log(`Example: http://localhost:${PORT}/metadata/1`);
});

module.exports = app;
