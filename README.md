# 🎨 Sui NFT Marketplace

A complete decentralized NFT marketplace built on the Sui blockchain featuring smart contracts, backend indexing, and REST API.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Deployment Guide](#deployment-guide)
- [API Documentation](#api-documentation)
- [What We Built](#what-we-built)
- [Limitations](#limitations)
- [Testing](#testing)
- [Project Structure](#project-structure)

## 🎯 Overview

This project implements a fully functional NFT marketplace on Sui blockchain with:
- **Smart Contract**: Move module for minting, listing, and trading NFTs
- **Backend**: NestJS server for event indexing and API exposure
- **Registry**: On-chain tracking of marketplace statistics

## ✨ Features

### Smart Contract (Move)
- ✅ Mint NFTs with metadata (name, description, URL)
- ✅ List NFTs for sale at custom prices
- ✅ Buy listed NFTs with SUI tokens
- ✅ Transfer/update NFT ownership
- ✅ Delist NFTs from marketplace
- ✅ Marketplace registry tracking stats
- ✅ Comprehensive event emissions

### Backend (NestJS)
- ✅ Event indexing from blockchain
- ✅ In-memory listing storage
- ✅ REST API with 6 endpoints
- ✅ Automatic transaction signing
- ✅ Real-time stats aggregation
- ✅ Periodic event synchronization

### Events
- `NFTMinted` - New NFT created
- `NFTListed` - NFT listed for sale
- `NFTSold` - Successful purchase
- `NFTDelisted` - Listing cancelled
- `OwnerUpdated` - Ownership transferred

## 🏗️ Architecture

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed system design, data flows, and diagrams.

**High-level overview**:
```
Client (HTTP) → Backend (NestJS) → Smart Contract (Move) → Sui Blockchain
                    ↓
              Event Indexer
                    ↓
            In-Memory Storage
```

## 📦 Prerequisites

- **Node.js** v18+ and npm
- **Sui CLI** installed ([installation guide](https://docs.sui.io/build/install))
- **Sui Wallet** with testnet SUI tokens ([faucet](https://discord.com/channels/916379725201563759/971488439931392130))
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nft-marketplace
```

### 2. Install Sui CLI (if not installed)

```bash
# macOS/Linux
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Verify installation
sui --version
```

### 3. Configure Sui Wallet

```bash
# Create new address (or use existing)
sui client new-address ed25519

# Switch to testnet
sui client switch --env testnet

# Get testnet tokens from faucet
sui client faucet

# Check balance
sui client gas
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

## 📝 Deployment Guide

### Step 1: Deploy Smart Contract

```bash
cd contract

# Build the contract
sui move build

# Deploy to testnet
sui client publish --gas-budget 100000000

# Save the output! You'll need:
# - Package ID (e.g., 0xabcd1234...)
# - MarketplaceRegistry Object ID (look for the shared object)
```

**Expected output**:
```
Successfully verified dependencies on-chain against source.
Transaction Digest: ...
╭─────────────────────────────────────────────────────────╮
│ Object Changes                                          │
├─────────────────────────────────────────────────────────┤
│ Created Objects:                                        │
│  ┌──                                                    │
│  │ ObjectID: 0x123abc... ← PACKAGE_ID                  │
│  │ ...                                                  │
│  ┌──                                                    │
│  │ ObjectID: 0x456def... ← REGISTRY_ID (shared)        │
│  │ ...                                                  │
╰─────────────────────────────────────────────────────────╯
```

### Step 2: Configure Backend

```bash
cd ../backend

# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

Update `.env`:
```env
PACKAGE_ID=0x123abc...        # From deployment output
REGISTRY_ID=0x456def...       # From deployment output (shared object)
PRIVATE_KEY=your_private_key  # From sui client export
PORT=3000
```

**Get your private key**:
```bash
# Export your active address private key
sui keytool export --key-identity <your-address>

# Or list all addresses and keys
sui keytool list
```

### Step 3: Start Backend Server

```bash
cd backend

# Development mode
npm run dev

# Or build and run production
npm run build
npm start
```

**Expected output**:
```
🚀 NFT Marketplace Backend running on http://localhost:3000
📊 API Endpoints:
   GET  /api/listings - Get all NFT listings
   GET  /api/listings/:nftId - Get specific listing
   GET  /api/stats - Get marketplace statistics
   POST /api/mint - Mint a new NFT
   POST /api/buy - Buy an NFT
   POST /api/list - List an NFT for sale
```

### Step 4: Verify Deployment

```bash
# Check backend health
curl http://localhost:3000/api/stats

# Expected response:
{
  "success": true,
  "data": {
    "totalNftsMinted": 0,
    "totalNftsListed": 0,
    "totalSales": 0,
    "totalVolume": 0
  }
}
```

## 📚 API Documentation

Base URL: `http://localhost:3000`

### Endpoints

#### 1. Get All Listings

```http
GET /api/listings
```

**Response**:
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "nftId": "0x789...",
        "seller": "0xabc...",
        "price": "1000000000",
        "timestamp": "1234567890"
      }
    ],
    "stats": {
      "totalNftsMinted": 5,
      "totalNftsListed": 2,
      "totalSales": 3,
      "totalVolume": 5000000000
    },
    "count": 2
  }
}
```

#### 2. Get Specific Listing

```http
GET /api/listings/:nftId
```

**Response**:
```json
{
  "success": true,
  "data": {
    "nftId": "0x789...",
    "seller": "0xabc...",
    "price": "1000000000",
    "timestamp": "1234567890"
  }
}
```

#### 3. Mint NFT

```http
POST /api/mint
Content-Type: application/json

{
  "name": "My Awesome NFT",
  "description": "This is a unique digital artwork",
  "url": "https://example.com/nft-image.png"
}
```

**Response**:
```json
{
  "success": true,
  "message": "NFT minted successfully",
  "data": {
    "digest": "0x...",
    "effects": {...},
    "events": [...]
  }
}
```

#### 4. List NFT for Sale

```http
POST /api/list
Content-Type: application/json

{
  "nftId": "0x789...",
  "price": 1000000000
}
```

**Note**: Price is in MIST (1 SUI = 1,000,000,000 MIST)

**Response**:
```json
{
  "success": true,
  "message": "NFT listed successfully",
  "data": {
    "digest": "0x...",
    "effects": {...}
  }
}
```

#### 5. Buy NFT

```http
POST /api/buy
Content-Type: application/json

{
  "nftId": "0x789..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "NFT purchased successfully",
  "data": {
    "digest": "0x...",
    "effects": {...}
  }
}
```

#### 6. Get Marketplace Stats

```http
GET /api/stats
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalNftsMinted": 10,
    "totalNftsListed": 3,
    "totalSales": 7,
    "totalVolume": 15000000000
  }
}
```

## 🔨 What We Built

### 1. Smart Contract (`contract/sources/marketplace.move`)

**Quality Features**:
- ✅ **Comprehensive Error Handling**: Custom error codes for validation
- ✅ **Secure Ownership Model**: Owner verification on all sensitive operations
- ✅ **Event-Driven Architecture**: Detailed events for all state changes
- ✅ **Gas Optimization**: Efficient use of Table for listings storage
- ✅ **Registry Pattern**: Shared object for global marketplace state
- ✅ **View Functions**: Query NFT and marketplace data
- ✅ **Test Support**: Test-only initialization function

**Key Highlights**:
- Uses Move's ownership model for secure NFT transfers
- Shared `MarketplaceRegistry` object tracks all marketplace activity
- Table-based listing storage for efficient lookups
- Comprehensive event emissions for backend indexing
- Payment verification before NFT transfers

### 2. Backend Application (`backend/src/`)

**Architecture**:
- ✅ **Modular Design**: Separate modules for Marketplace and Sui services
- ✅ **Event Indexing**: Automatic blockchain event synchronization
- ✅ **Clean API**: RESTful endpoints with proper HTTP status codes
- ✅ **Error Handling**: Comprehensive error catching and logging
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **State Management**: In-memory listing cache with periodic updates

**Code Quality**:
- NestJS best practices (dependency injection, modules)
- Service-oriented architecture
- Proper separation of concerns (Controller → Service → Blockchain)
- Extensive logging for debugging
- Input validation on all endpoints

### 3. Documentation

- ✅ **Architecture Diagram**: Detailed system flow documentation
- ✅ **API Documentation**: Complete endpoint specifications
- ✅ **Deployment Guide**: Step-by-step setup instructions
- ✅ **Code Comments**: Well-documented source code

## ⚠️ Limitations

### Current Implementation

1. **Single Wallet Backend**
   - Backend controls only one wallet/address
   - All transactions signed by backend's private key
   - Not suitable for multi-user production use
   - **Impact**: Users can't sign their own transactions

2. **In-Memory Storage**
   - Listings stored in memory, not persisted
   - Data lost on server restart
   - Re-indexes from blockchain on startup
   - **Impact**: Slower startup, no historical data

3. **No Authentication**
   - No user accounts or authentication system
   - Anyone can call any endpoint
   - No rate limiting or access control
   - **Impact**: Not production-ready

4. **Polling-Based Event Indexing**
   - Polls for events every 30 seconds
   - Not real-time updates
   - Higher latency for new listings
   - **Impact**: Up to 30s delay for listing updates

5. **Limited Error Recovery**
   - No retry logic for failed transactions
   - No transaction queue
   - No dead letter queue for failed events
   - **Impact**: Manual intervention needed for failures

6. **Simplified Payment Handling**
   - Uses first available coin with sufficient balance
   - No coin merging or splitting optimization
   - No gas estimation
   - **Impact**: May fail with fragmented coins

7. **No Frontend**
   - API only, no user interface
   - Requires manual API calls or CLI tools
   - **Impact**: Not user-friendly for non-developers

8. **Testnet Only**
   - Not deployed to mainnet
   - Using test SUI tokens
   - **Impact**: No real value transactions

9. **No Metadata Storage**
   - NFT metadata (images) not stored on-chain
   - Relies on external URLs
   - No IPFS integration
   - **Impact**: Centralized metadata storage

10. **No Royalties or Fees**
    - No marketplace commission
    - No creator royalties on secondary sales
    - **Impact**: No revenue model

### Security Considerations

- Private key stored in environment variable (not secure for production)
- No input sanitization beyond basic validation
- No rate limiting or DDoS protection
- No audit of smart contract code

### Scalability Limitations

- Single backend instance (no horizontal scaling)
- In-memory storage (limited by RAM)
- Polling instead of event subscriptions
- No caching layer (Redis, etc.)

## 🧪 Testing

### Manual Testing

1. **Test Minting**:
```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test NFT",
    "description": "A test NFT",
    "url": "https://via.placeholder.com/400"
  }'
```

2. **Check Listings**:
```bash
curl http://localhost:3000/api/listings
```

3. **List an NFT** (use NFT ID from mint response):
```bash
curl -X POST http://localhost:3000/api/list \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "0x...",
    "price": 1000000000
  }'
```

4. **Buy an NFT**:
```bash
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "0x..."
  }'
```

### Verify on Sui Explorer

View transactions and objects on [Sui Testnet Explorer](https://suiexplorer.com/?network=testnet):
- Search for your package ID
- View NFT objects
- Check transaction history
- Verify events

## 📁 Project Structure

```
nft-marketplace/
├── contract/                    # Sui Move smart contract
│   ├── sources/
│   │   └── marketplace.move     # Main marketplace contract
│   ├── Move.toml                # Move package configuration
│   └── tests/                   # Contract tests (future)
│
├── backend/                     # NestJS backend server
│   ├── src/
│   │   ├── marketplace/         # Marketplace module
│   │   │   ├── marketplace.controller.ts   # HTTP endpoints
│   │   │   ├── marketplace.service.ts      # Business logic
│   │   │   └── marketplace.module.ts       # Module definition
│   │   ├── sui/                 # Sui blockchain integration
│   │   │   └── sui.service.ts   # Blockchain interaction
│   │   ├── app.module.ts        # Root module
│   │   └── main.ts              # Application entry point
│   ├── package.json             # Node dependencies
│   ├── tsconfig.json            # TypeScript config
│   └── .env.example             # Environment template
│
├── docs/
│   └── ARCHITECTURE.md          # Detailed architecture docs
│
└── README.md                    # This file
```

## 🎓 Learning Resources

- [Sui Move Documentation](https://docs.sui.io/build/move)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Move by Example](https://examples.sui.io/)

## 🤝 Contributing

This is a demo project for educational purposes. Feel free to:
- Report issues
- Suggest improvements
- Fork and extend functionality
- Use as a learning resource

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with [Sui](https://sui.io/) blockchain
- Uses [NestJS](https://nestjs.com/) framework
- Powered by [@mysten/sui.js](https://www.npmjs.com/package/@mysten/sui.js)

---

**Built for the Sui NFT Marketplace Challenge** 🚀

For questions or issues, please open a GitHub issue.
