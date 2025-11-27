# 🚀 Quick Start Guide

Get your NFT marketplace running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- Sui CLI installed ([guide](https://docs.sui.io/build/install))
- Testnet SUI tokens

## Quick Setup

### 1. Get Testnet Tokens (if needed)

```bash
sui client switch --env testnet
sui client faucet
```

### 2. Automated Deployment

```bash
# Run deployment script
./deploy.sh
```

The script will:
- Build the Move contract
- Deploy to testnet
- Extract Package ID and Registry ID
- Create backend .env file

### 3. Start Backend

```bash
cd backend
npm install
npm run dev
```

### 4. Test It

```bash
# Get stats
curl http://localhost:3000/api/stats

# Mint an NFT
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First NFT",
    "description": "Testing the marketplace",
    "url": "https://via.placeholder.com/400"
  }'

# Check listings
curl http://localhost:3000/api/listings
```

## Manual Deployment (Alternative)

If the automated script fails:

### 1. Deploy Contract

```bash
cd contract
sui move build
sui client publish --gas-budget 100000000
```

Save the `Package ID` and `MarketplaceRegistry` object ID.

### 2. Configure Backend

```bash
cd ../backend
cp .env.example .env
```

Edit `.env`:
```env
PACKAGE_ID=0x...    # From deployment
REGISTRY_ID=0x...   # From deployment
PRIVATE_KEY=...     # Run: sui keytool export
PORT=3000
```

### 3. Start Backend

```bash
npm install
npm run dev
```

## Common Issues

### "Insufficient gas"
```bash
sui client faucet  # Get more testnet SUI
```

### "Package ID not found"
- Check deployment output for `PackageID`
- Look for object with type ending in `::marketplace`

### "Private key invalid"
```bash
# Export your private key
sui keytool export --key-identity $(sui client active-address)
```

### Backend won't start
```bash
# Check Node version
node --version  # Should be v18+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
3. Review [API documentation](README.md#api-documentation)
4. Explore the smart contract code in `contract/sources/marketplace.move`

## API Endpoints

Once running, you have:

- `GET /api/listings` - Get all NFT listings
- `GET /api/stats` - Get marketplace statistics
- `POST /api/mint` - Mint a new NFT
- `POST /api/buy` - Purchase an NFT
- `POST /api/list` - List an NFT for sale

## Testing Flow

1. **Mint** an NFT via `/api/mint`
2. Copy the NFT ID from the response
3. **List** it via `/api/list` with the NFT ID and price
4. Check it appears in `/api/listings`
5. **Buy** it via `/api/buy` with the NFT ID
6. Verify stats updated in `/api/stats`

## Explorer Links

View your deployment:
- **Sui Testnet Explorer**: https://suiexplorer.com/?network=testnet
- Search for your Package ID or transaction digests
- View NFT objects and marketplace registry

## Getting Help

- Check [README.md](README.md) for detailed docs
- Review contract code for Move function details
- Examine backend logs for error messages
- Verify .env file is correctly configured

---

**Happy Building! 🎨**
