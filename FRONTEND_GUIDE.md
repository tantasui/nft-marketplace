# 🎨 Frontend Setup Guide

Complete guide for setting up and running the NFT Marketplace frontend with wallet integration.

## Overview

The frontend is a React application that allows users to mint, list, and buy NFTs on Sui blockchain. All transactions are signed by the user's wallet - the backend only provides data.

## Quick Start

### 1. Deploy Smart Contract

```bash
cd contract
sui move build
sui client publish --gas-budget 100000000
```

Save the **Package ID** and **Registry ID** from the output.

### 2. Configure and Start Backend

```bash
cd ../backend
cp .env.example .env
# Edit .env with your Package ID and Registry ID
npm install
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Configure and Start Frontend

```bash
cd ../frontend
cp .env.example .env
# Edit .env with your Package ID, Registry ID, and backend URL
npm install
npm run dev
```

Frontend will open at `http://localhost:5173`

### 4. Connect Wallet

1. Install Sui Wallet extension in your browser
2. Create/import a wallet
3. Switch to testnet
4. Get testnet SUI from faucet
5. Open the app and click "Connect Wallet"

## Detailed Setup

### Prerequisites

#### 1. Sui Wallet Extension

Install one of these:
- **Sui Wallet** (recommended): [Chrome Store](https://chrome.google.com/webstore/detail/sui-wallet/)
- **Ethos Wallet**
- **Suiet**

#### 2. Testnet SUI Tokens

Get free testnet tokens:
```bash
# Via CLI
sui client faucet

# Or join Sui Discord and use #testnet-faucet channel
```

#### 3. Node.js v18+

```bash
node --version  # Should be v18 or higher
```

### Environment Configuration

#### Backend `.env`

```env
PACKAGE_ID=0xYOUR_PACKAGE_ID
REGISTRY_ID=0xYOUR_REGISTRY_ID
PORT=3000
```

#### Frontend `.env`

```env
VITE_PACKAGE_ID=0xYOUR_PACKAGE_ID
VITE_REGISTRY_ID=0xYOUR_REGISTRY_ID
VITE_BACKEND_URL=http://localhost:3000
```

**Important**: Use the same Package ID and Registry ID in both files!

## Using the Application

### Minting an NFT

1. **Connect Wallet**: Click "Connect Wallet" button
2. **Go to Mint Tab**: Click "✨ Mint NFT" tab
3. **Fill Form**:
   - **Name**: e.g., "My Awesome NFT"
   - **Description**: e.g., "A unique digital artwork"
   - **Image URL**: Direct link to image (e.g., `https://example.com/image.png`)
4. **Submit**: Click "Mint NFT"
5. **Sign Transaction**: Approve in your wallet popup
6. **Wait**: Transaction will be confirmed on blockchain
7. **Success**: You'll see a success message with transaction link

**Tips**:
- Use high-quality image URLs
- Make sure you have enough SUI for gas (~0.001-0.01 SUI)
- Wait for transaction confirmation before navigating away

### Listing an NFT for Sale

1. **Go to My NFTs**: Click "🖼️ My NFTs" tab
2. **Find Your NFT**: You'll see all NFTs you own
3. **Set Price**: Enter price in SUI (e.g., "1.5" for 1.5 SUI)
4. **List**: Click "List for Sale"
5. **Sign**: Approve the transaction in your wallet
6. **Confirm**: Wait for transaction confirmation
7. **Check**: Your NFT will appear in the Marketplace tab

**Price Guidelines**:
- Minimum: 0.01 SUI
- Enter in SUI (not MIST)
- Example: "2.5" = 2.5 SUI = 2,500,000,000 MIST

### Buying an NFT

1. **Browse Marketplace**: Go to "🛒 Marketplace" tab
2. **View Listings**: See all NFTs for sale
3. **Select NFT**: Click "Buy NFT" on desired item
4. **Check Price**: Make sure you have enough SUI
5. **Confirm**: Sign the transaction in your wallet
6. **Wait**: Transaction will be processed
7. **Success**: NFT will be transferred to your wallet

**Important**:
- You need enough SUI to cover price + gas fees
- You cannot buy your own listings
- Transaction is irreversible once signed

### Viewing Statistics

The stats section at the top shows:
- 🎨 **Total Minted**: All NFTs ever created
- 🏷️ **Currently Listed**: NFTs available for sale
- 💰 **Total Sales**: Number of successful purchases
- 📊 **Total Volume**: Combined value of all sales in SUI

Stats update every 15 seconds automatically.

## Transaction Flow

### How Frontend Signing Works

```
1. User clicks action (mint/list/buy)
   ↓
2. Frontend builds Transaction using @mysten/sui
   ↓
3. useSignAndExecuteTransaction prompts wallet
   ↓
4. User reviews and signs in wallet popup
   ↓
5. Transaction sent to blockchain
   ↓
6. Frontend waits for confirmation
   ↓
7. Backend indexes events (30s delay)
   ↓
8. UI updates with new data
```

### Why User Signs (Not Backend)

**Advantages**:
- ✅ User controls their own wallet
- ✅ More secure (no private keys on server)
- ✅ True decentralization
- ✅ Multi-user support
- ✅ Standard Web3 pattern

**Backend Role**:
- ✅ Index events from blockchain
- ✅ Provide aggregated data (listings, stats)
- ✅ Fast read operations
- ❌ No transaction signing
- ❌ No private keys

## Troubleshooting

### Wallet Issues

#### "Wallet not detected"
- Install Sui Wallet extension
- Refresh the page
- Check that extension is enabled

#### "Wrong network"
- Open wallet extension
- Click network dropdown
- Select "Testnet"

#### "Insufficient balance"
- Get testnet SUI: `sui client faucet`
- Or use Discord #testnet-faucet
- Wait a few seconds for tokens to arrive

### Transaction Issues

#### "Transaction failed"
**Common causes**:
- Not enough SUI for gas
- Wrong package/registry ID
- NFT already sold (for buys)
- Invalid price (for listings)

**Solutions**:
- Check SUI balance
- Verify `.env` configuration
- Refresh listings
- Try again with valid inputs

#### "Transaction pending forever"
- Check Sui Explorer for transaction status
- Network might be slow - wait up to 1 minute
- If stuck, refresh page and try again

### Display Issues

#### "NFTs not showing"
- Click "🔄 Refresh NFTs" button
- Wait 30 seconds for backend to index
- Check transaction was successful on Explorer

#### "Listings not updating"
- Backend indexes every 30 seconds
- Click "🔄 Refresh Listings"
- Check browser console for errors

#### "Stats not updating"
- Stats refresh every 15 seconds
- Make sure backend is running
- Check `VITE_BACKEND_URL` in `.env`

### Configuration Issues

#### "Cannot read properties of undefined"
**Cause**: Environment variables not loaded

**Solution**:
```bash
# Make sure .env exists
cp .env.example .env

# Edit with correct values
nano .env

# Restart dev server
npm run dev
```

#### "Failed to fetch config"
**Cause**: Backend not running or wrong URL

**Solution**:
```bash
# Check backend is running
curl http://localhost:3000/api/stats

# Check VITE_BACKEND_URL in frontend/.env
# Should match backend port (default 3000)
```

## Development

### Adding a New Feature

1. **Create Component**:
```typescript
// src/components/MyFeature.tsx
export function MyFeature() {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  // ... component code
}
```

2. **Build Transaction**:
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::marketplace::my_function`,
  arguments: [tx.object(REGISTRY_ID), tx.pure.string('data')],
});
```

3. **Execute with Wallet**:
```typescript
signAndExecuteTransaction(
  { transaction: tx, chain: 'sui:testnet' },
  {
    onSuccess: (result) => console.log('Success:', result.digest),
    onError: (error) => console.error('Error:', error.message),
  }
);
```

### Testing

#### Manual Testing Checklist

- [ ] Connect wallet successfully
- [ ] Mint NFT and see it in "My NFTs"
- [ ] List NFT and see it in "Marketplace"
- [ ] Buy NFT (use different wallet)
- [ ] Stats update correctly
- [ ] Refresh buttons work
- [ ] Links to Explorer work
- [ ] Error messages display properly

#### Testing with Multiple Wallets

1. Use different browser profiles
2. Or use different wallet extensions
3. Test buying your own listings (should fail)
4. Test buying from different seller (should work)

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Serve built files
npm run preview

# Or deploy to hosting service
# dist/ folder contains all static files
```

## Architecture Notes

### Why This Stack?

**@mysten/dapp-kit**:
- Official Sui wallet integration
- Handles multiple wallet types
- Standard hooks (useCurrentAccount, useSignAndExecuteTransaction)
- Well-maintained

**@mysten/sui**:
- Official Sui SDK
- Transaction building
- RPC client
- Type safety

**React Query**:
- Required by dapp-kit
- Caching and data fetching
- Auto-refresh capabilities

### Data Flow

```
┌─────────────────────────────────────────┐
│         User Action (Frontend)          │
│   - Mint NFT                            │
│   - List NFT                            │
│   - Buy NFT                             │
└────────────────┬────────────────────────┘
                 │
                 │ 1. Build Transaction
                 ↓
┌─────────────────────────────────────────┐
│       Transaction (Frontend)            │
│   - Use @mysten/sui/transactions        │
│   - Add moveCall with contract target   │
└────────────────┬────────────────────────┘
                 │
                 │ 2. Request Signature
                 ↓
┌─────────────────────────────────────────┐
│          User's Wallet                  │
│   - Review transaction                  │
│   - Sign with private key               │
│   - Broadcast to network                │
└────────────────┬────────────────────────┘
                 │
                 │ 3. Blockchain Execution
                 ↓
┌─────────────────────────────────────────┐
│         Sui Blockchain                  │
│   - Execute Move function               │
│   - Emit events                         │
│   - Update state                        │
└────────────────┬────────────────────────┘
                 │
                 │ 4. Event Indexing
                 ↓
┌─────────────────────────────────────────┐
│          Backend (Read-Only)            │
│   - Query events every 30s              │
│   - Index active listings               │
│   - Aggregate statistics                │
└────────────────┬────────────────────────┘
                 │
                 │ 5. Data Fetch
                 ↓
┌─────────────────────────────────────────┐
│         Frontend (Display)              │
│   - GET /api/listings                   │
│   - GET /api/stats                      │
│   - Update UI                           │
└─────────────────────────────────────────┘
```

## Security Considerations

### What's Secure

✅ **User controls private keys**: Never leave user's wallet
✅ **Transaction review**: User sees what they're signing
✅ **No backend keys**: Backend cannot sign transactions
✅ **Input validation**: Frontend validates before building tx
✅ **Network isolation**: Testnet only for development

### Best Practices

1. **Always review transactions** in wallet before signing
2. **Use testnet** for development and testing
3. **Check contract addresses** match deployed values
4. **Verify transaction results** on Sui Explorer
5. **Keep wallet extension updated**
6. **Never share private keys** or seed phrases

## Helpful Resources

### Documentation
- [Sui Docs](https://docs.sui.io/)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [dApp Kit Guide](https://sdk.mystenlabs.com/dapp-kit)

### Tools
- [Sui Explorer (Testnet)](https://suiexplorer.com/?network=testnet)
- [Sui Faucet](https://discord.gg/sui) (#testnet-faucet channel)
- [Sui TypeScript Examples](https://examples.sui.io/)

### Support
- [Sui Discord](https://discord.gg/sui)
- [GitHub Issues](https://github.com/MystenLabs/sui/issues)
- Project README.md for more details

## Summary

### Frontend Responsibilities
- ✅ Build transactions
- ✅ Request user signatures
- ✅ Display data from backend
- ✅ Handle user interactions

### Backend Responsibilities
- ✅ Index blockchain events
- ✅ Provide listings via API
- ✅ Calculate statistics
- ❌ **No transaction signing**

### User Responsibilities
- ✅ Have wallet with SUI
- ✅ Review and sign transactions
- ✅ Pay gas fees
- ✅ Secure their wallet

---

**Happy Building! 🚀**

For more information, see:
- [README.md](README.md) - Main documentation
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [frontend/README.md](frontend/README.md) - Frontend-specific docs
