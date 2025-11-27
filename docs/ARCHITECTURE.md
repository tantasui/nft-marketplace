# NFT Marketplace Architecture

## System Overview

This NFT marketplace is built on the Sui blockchain with a three-tier architecture: Smart Contract, Backend, and Client layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                   (Web/Mobile/CLI Applications)                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                       BACKEND LAYER                              │
│                    (NestJS/Node.js Server)                       │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Marketplace Controller                      │   │
│  │   GET  /api/listings    - Get all active listings       │   │
│  │   GET  /api/stats       - Get marketplace stats         │   │
│  │   POST /api/mint        - Mint new NFT                  │   │
│  │   POST /api/buy         - Buy an NFT                    │   │
│  │   POST /api/list        - List NFT for sale             │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │           Marketplace Service (Business Logic)          │   │
│  │  • Index blockchain events                              │   │
│  │  • Store active listings in memory                      │   │
│  │  • Aggregate marketplace statistics                     │   │
│  │  • Coordinate transaction execution                     │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
│  ┌──────────────────────▼──────────────────────────────────┐   │
│  │              Sui Service (Blockchain Layer)             │   │
│  │  • Manage Sui client connection                         │   │
│  │  • Build and sign transactions                          │   │
│  │  • Query events and objects                             │   │
│  │  • Handle keypair management                            │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                        │
└─────────────────────────┼────────────────────────────────────────┘
                          │
                          │ Sui RPC API (@mysten/sui.js)
                          │
┌─────────────────────────▼─────────────────────────────────────┐
│                   SUI BLOCKCHAIN (TESTNET)                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Smart Contract (Move Module)                │  │
│  │              nft_marketplace::marketplace                │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │         Shared Object: MarketplaceRegistry       │   │  │
│  │  │  • total_nfts_minted: u64                        │   │  │
│  │  │  • total_nfts_listed: u64                        │   │  │
│  │  │  • total_sales: u64                              │   │  │
│  │  │  • total_volume: u64                             │   │  │
│  │  │  • listings: Table<ID, Listing>                  │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │            Core Functions                         │   │  │
│  │  │  • mint_nft() - Create new NFT                   │   │  │
│  │  │  • list_nft() - List NFT for sale                │   │  │
│  │  │  • buy_nft() - Purchase listed NFT               │   │  │
│  │  │  • delist_nft() - Remove listing                 │   │  │
│  │  │  • update_owner() - Transfer ownership           │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │              Event Emissions                      │   │  │
│  │  │  • NFTMinted(nft_id, creator, owner, name)       │   │  │
│  │  │  • NFTListed(nft_id, seller, price)              │   │  │
│  │  │  • NFTSold(nft_id, seller, buyer, price)         │   │  │
│  │  │  • NFTDelisted(nft_id, seller)                   │   │  │
│  │  │  • OwnerUpdated(nft_id, old_owner, new_owner)    │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Smart Contract Layer (Move Module)

**File**: `contract/sources/marketplace.move`

#### Key Components:

- **NFT Struct**: Represents a unique digital asset with metadata
  ```move
  public struct NFT has key, store {
      id: UID,
      name: String,
      description: String,
      url: Url,
      creator: address,
      owner: address,
  }
  ```

- **MarketplaceRegistry**: Shared object that tracks global marketplace state
  - Acts as a central registry for all marketplace operations
  - Stores active listings in a Table data structure
  - Maintains aggregate statistics (total mints, sales, volume)

- **Listing Struct**: Represents an active sale listing
  ```move
  public struct Listing has store, drop, copy {
      nft_id: ID,
      seller: address,
      price: u64,
      listed: bool,
  }
  ```

#### Core Functions:

1. **mint_nft()**: Creates a new NFT and transfers it to the minter
2. **list_nft()**: Lists an NFT for sale at a specified price
3. **buy_nft()**: Purchases a listed NFT with SUI tokens
4. **delist_nft()**: Removes an NFT from the marketplace
5. **update_owner()**: Transfers NFT ownership directly

#### Events:

All key operations emit events that the backend indexes:
- `NFTMinted`: New NFT created
- `NFTListed`: NFT listed for sale
- `NFTSold`: NFT successfully sold
- `NFTDelisted`: Listing cancelled
- `OwnerUpdated`: Ownership transferred

### 2. Backend Layer (NestJS)

**Directory**: `backend/src/`

#### Architecture Pattern: Modular NestJS with Service-Oriented Design

##### Sui Service (`sui/sui.service.ts`)
- **Responsibility**: Direct blockchain interaction
- **Key Methods**:
  - `mintNFT()`: Builds and executes mint transaction
  - `listNFT()`: Builds and executes list transaction
  - `buyNFT()`: Builds and executes buy transaction with payment
  - `queryEvents()`: Fetches events from blockchain
  - `getListings()`: Retrieves active listings from events

##### Marketplace Service (`marketplace/marketplace.service.ts`)
- **Responsibility**: Business logic and event indexing
- **Key Features**:
  - Event indexing on startup and periodic refresh (30s intervals)
  - In-memory storage of active listings
  - Statistics aggregation from blockchain events
  - Transaction coordination

##### Marketplace Controller (`marketplace/marketplace.controller.ts`)
- **Responsibility**: HTTP API endpoints
- **Endpoints**:
  ```
  GET  /api/listings        - Retrieve all active listings
  GET  /api/listings/:id    - Get specific listing details
  GET  /api/stats           - Get marketplace statistics
  POST /api/mint            - Mint a new NFT
  POST /api/buy             - Purchase a listed NFT
  POST /api/list            - List an NFT for sale
  ```

#### Event Indexing Strategy:

1. **Initial Indexing**: On service startup, fetch all historical events
2. **Periodic Updates**: Every 30 seconds, re-index events
3. **Event Processing**:
   - Fetch all event types (Minted, Listed, Sold, Delisted)
   - Build active listings by filtering out sold/delisted items
   - Calculate aggregate statistics
4. **State Management**: Maintain in-memory cache of active listings

### 3. Client Layer

**Integration Points**:

Clients interact with the backend via REST API:

```javascript
// Example: Mint an NFT
POST /api/mint
{
  "name": "My NFT",
  "description": "A cool NFT",
  "url": "https://example.com/nft.png"
}

// Example: Get all listings
GET /api/listings

// Example: Buy an NFT
POST /api/buy
{
  "nftId": "0x123..."
}
```

## Data Flow Examples

### Flow 1: Minting an NFT

```
1. Client → Backend: POST /api/mint
   {name, description, url}

2. Backend (Marketplace Service):
   - Receives request
   - Calls SuiService.mintNFT()

3. Backend (Sui Service):
   - Builds TransactionBlock
   - Calls contract: marketplace::mint_nft()
   - Signs and executes transaction

4. Smart Contract:
   - Creates new NFT object
   - Updates registry.total_nfts_minted
   - Emits NFTMinted event
   - Transfers NFT to creator

5. Backend:
   - Waits 2 seconds
   - Re-indexes events
   - Updates in-memory state

6. Backend → Client:
   {success: true, digest, events}
```

### Flow 2: Listing an NFT

```
1. Client → Backend: POST /api/list
   {nftId, price}

2. Backend → Smart Contract:
   - Calls marketplace::list_nft(registry, nft, price)

3. Smart Contract:
   - Validates owner
   - Creates Listing record
   - Stores in registry.listings table
   - Updates registry.total_nfts_listed
   - Emits NFTListed event
   - Transfers NFT to contract address

4. Backend:
   - Re-indexes events
   - Updates listings cache

5. Other clients can now see listing via GET /api/listings
```

### Flow 3: Buying an NFT

```
1. Client → Backend: POST /api/buy
   {nftId}

2. Backend (Marketplace Service):
   - Checks if NFT is listed
   - Gets price from listing
   - Fetches user's SUI coins

3. Backend (Sui Service):
   - Builds transaction with coin payment
   - Calls marketplace::buy_nft(registry, nft, payment)

4. Smart Contract:
   - Validates listing exists
   - Verifies payment amount
   - Updates NFT owner
   - Removes listing from table
   - Updates statistics (total_sales, total_volume)
   - Emits NFTSold and OwnerUpdated events
   - Transfers payment to seller
   - Transfers NFT to buyer

5. Backend:
   - Re-indexes events
   - Updates listings and stats

6. Backend → Client:
   {success: true, digest, events}
```

## Security Considerations

1. **Smart Contract**:
   - Owner validation on all sensitive operations
   - Payment verification before transfers
   - Access control on listing modifications

2. **Backend**:
   - Private key management via environment variables
   - Input validation on all endpoints
   - Error handling and logging

3. **Limitations** (see README):
   - Single backend instance (no distributed state)
   - In-memory storage (data lost on restart)
   - No authentication/authorization
   - Backend controls a single wallet

## Scalability Considerations

**Current Architecture**: Suitable for demo/small-scale deployment

**Future Improvements**:
- Database integration (PostgreSQL/MongoDB)
- WebSocket support for real-time updates
- Multiple wallet support with authentication
- Caching layer (Redis)
- Load balancing for multiple backend instances
- Event subscription instead of polling

## Technology Stack

- **Smart Contract**: Move language, Sui Framework
- **Backend**: Node.js, NestJS, TypeScript, @mysten/sui.js
- **Blockchain**: Sui Testnet
- **API**: RESTful HTTP/JSON

## Deployment Flow

```
1. Deploy Smart Contract → Get Package ID & Registry ID
2. Configure Backend (.env) → Set IDs and private key
3. Start Backend → Indexes events, exposes API
4. Connect Client → Interact via REST endpoints
```
