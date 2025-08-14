# 21 Sats Reservation Pass - Metadata API

This directory contains the structure for the metadata API that serves NFT metadata for the 21 Sats Reservation Pass contract.

## Structure

- `/metadata/`: Contains JSON files for each token ID
  - `/full/`: Metadata for full Satoshi KNYTs (token IDs for full tokens)
  - `/shard/`: Metadata for Satoshi KNYT Shards (token IDs for shard tokens)
- `/images/`: Contains images for each token
  - `/full/`: Images for full Satoshi KNYTs
  - `/shard/`: Images for Satoshi KNYT Shards

## Metadata Format

Each token's metadata follows the [OpenSea metadata standard](https://docs.opensea.io/docs/metadata-standards) for compatibility with NFT marketplaces.

### Example Metadata (Full Token)

```json
{
  "name": "Satoshi KNYT #1",
  "description": "Full ownership of Satoshi KNYT #1, part of the exclusive collection of 21 Satoshi KNYTs.",
  "image": "https://api.21sats.com/images/full/1.png",
  "external_url": "https://21sats.com/token/1",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Full"
    },
    {
      "trait_type": "Edition",
      "value": "Genesis"
    },
    {
      "trait_type": "Satoshi Number",
      "value": 1
    }
  ]
}
```

### Example Metadata (Shard Token)

```json
{
  "name": "Satoshi KNYT Shard #19",
  "description": "Fractional ownership shard of Satoshi KNYT, part of the exclusive collection of 42 Satoshi KNYT Shards.",
  "image": "https://api.21sats.com/images/shard/19.png",
  "external_url": "https://21sats.com/token/19",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "Shard"
    },
    {
      "trait_type": "Shard Type",
      "value": "Sale"
    },
    {
      "trait_type": "Parent KNYT",
      "value": 19
    }
  ]
}
```

## Deployment

This API structure can be deployed to:
1. A static hosting service (AWS S3, Netlify, Vercel)
2. A serverless function (AWS Lambda, Vercel Functions)
3. A traditional server (Node.js Express server)

## Integration

The contract's baseURI is set to: `https://api.21sats.com/metadata/`

When a token ID is requested, the API should respond with the appropriate JSON metadata file.
