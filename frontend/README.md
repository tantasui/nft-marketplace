# NFT Marketplace Frontend

React frontend for the Sui NFT Marketplace with wallet integration.

## Features

- 🔐 Wallet connection with Sui wallets
- ✨ Mint NFTs (user signs transaction)
- 🛒 Browse marketplace listings
- 💰 Buy NFTs (user signs transaction)
- 🖼️ View and list your owned NFTs
- 📊 Real-time marketplace statistics

## Prerequisites

- Node.js v18+
- A Sui wallet browser extension (Sui Wallet, Ethos, etc.)
- Testnet SUI tokens

## Installation

```bash
cd frontend
npm install
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your deployed contract details:
```env
VITE_PACKAGE_ID=0x...      # Your deployed package ID
VITE_REGISTRY_ID=0x...      # Your marketplace registry ID
VITE_BACKEND_URL=http://localhost:3000
```

## Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### 1. Connect Wallet

Click "Connect Wallet" and select your Sui wallet. Make sure you're on testnet and have SUI tokens for gas fees.

### 2. Mint NFT

1. Go to the "Mint NFT" tab
2. Enter name, description, and image URL
3. Click "Mint NFT"
4. Sign the transaction in your wallet
5. Wait for confirmation

### 3. List NFT for Sale

1. Go to "My NFTs" tab
2. Find the NFT you want to sell
3. Enter a price in SUI
4. Click "List for Sale"
5. Sign the transaction
6. Your NFT will appear in the Marketplace

### 4. Buy NFT

1. Go to "Marketplace" tab
2. Browse available NFTs
3. Click "Buy NFT"
4. Sign the transaction
5. The NFT will be transferred to your wallet

## Architecture

### Transaction Signing

All transactions are signed by the user's wallet on the frontend. The backend only provides data (listings, stats) and does not sign any transactions.

**Frontend responsibilities:**
- Build transactions using `@mysten/sui/transactions`
- Prompt user to sign with `useSignAndExecuteTransaction`
- Handle transaction results

**Backend responsibilities:**
- Index blockchain events
- Provide listings and stats via REST API
- No transaction signing

### Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **@mysten/dapp-kit** - Sui wallet integration
- **@mysten/sui** - Sui SDK
- **@tanstack/react-query** - Data fetching

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Marketplace.tsx       # Main container
│   │   ├── MintNFT.tsx          # Mint NFT form
│   │   ├── Listings.tsx         # Browse and buy
│   │   ├── MyNFTs.tsx           # User's NFTs and listing
│   │   └── Stats.tsx            # Marketplace stats
│   ├── config/
│   │   ├── constants.ts         # Contract addresses
│   │   └── networks.ts          # Network configuration
│   ├── App.tsx                  # App with providers
│   ├── main.tsx                 # Entry point
│   └── App.css                  # Styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API Integration

The frontend fetches data from the backend:

```typescript
// Get all listings
GET http://localhost:3000/api/listings

// Get marketplace stats
GET http://localhost:3000/api/stats

// Get contract config
GET http://localhost:3000/api/config
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Troubleshooting

### Wallet Not Connecting

- Make sure you have a Sui wallet extension installed
- Check that the wallet is on testnet
- Try refreshing the page

### Transaction Failing

- Ensure you have enough SUI for gas fees
- Check that PACKAGE_ID and REGISTRY_ID are correct
- Verify the contract is deployed on testnet

### NFTs Not Showing

- Wait a few seconds after minting
- Click the "Refresh" button
- Check if the transaction was successful on Sui Explorer

## Development

### Adding New Features

1. Create components in `src/components/`
2. Build transactions using `@mysten/sui/transactions`
3. Use `useSignAndExecuteTransaction` for signing
4. Handle results and update UI

### Example Transaction

```typescript
import { Transaction } from '@mysten/sui/transactions';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

const handleAction = () => {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::marketplace::some_function`,
    arguments: [
      tx.object(REGISTRY_ID),
      tx.pure.string('value'),
    ],
  });

  signAndExecuteTransaction(
    {
      transaction: tx,
      chain: 'sui:testnet',
    },
    {
      onSuccess: (result) => {
        console.log('Success:', result);
      },
      onError: (error) => {
        console.error('Error:', error);
      },
    }
  );
};
```

## Support

For issues or questions:
1. Check the main [README.md](../README.md)
2. Review the [ARCHITECTURE.md](../docs/ARCHITECTURE.md)
3. Verify your environment configuration

## License

MIT
