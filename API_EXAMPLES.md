# API Examples

Quick reference for testing the NFT marketplace API.

## Base URL

```
http://localhost:3000
```

## Endpoints

### 1. Get Marketplace Statistics

```bash
curl http://localhost:3000/api/stats
```

**Response:**
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

### 2. Get All Listings

```bash
curl http://localhost:3000/api/listings
```

**Response:**
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
    "stats": {...},
    "count": 1
  }
}
```

### 3. Get Specific Listing

```bash
curl http://localhost:3000/api/listings/0x789abc...
```

### 4. Mint a New NFT

```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Awesome NFT",
    "description": "This is a unique digital artwork showcasing creativity",
    "url": "https://via.placeholder.com/400/FF6B6B/FFFFFF?text=My+NFT"
  }'
```

**More Examples:**

```bash
# Mint a landscape NFT
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mountain Sunrise",
    "description": "Beautiful mountain landscape at sunrise",
    "url": "https://picsum.photos/400/400?random=1"
  }'

# Mint an abstract art NFT
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abstract Circles #42",
    "description": "Modern abstract art with geometric patterns",
    "url": "https://via.placeholder.com/400/4ECDC4/FFFFFF?text=Abstract+Art"
  }'

# Mint a collectible card
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rare Dragon Card",
    "description": "Legendary dragon card - 1 of 100",
    "url": "https://via.placeholder.com/400/FF3366/FFFFFF?text=Dragon+Card"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "NFT minted successfully",
  "data": {
    "digest": "0x123abc...",
    "effects": {...},
    "events": [...],
    "objectChanges": [...]
  }
}
```

### 5. List NFT for Sale

```bash
# List with price in MIST (1 SUI = 1,000,000,000 MIST)
curl -X POST http://localhost:3000/api/list \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "0x789abc...",
    "price": 1000000000
  }'
```

**Price Examples:**
- 0.1 SUI = 100000000 MIST
- 0.5 SUI = 500000000 MIST
- 1 SUI = 1000000000 MIST
- 5 SUI = 5000000000 MIST
- 10 SUI = 10000000000 MIST

```bash
# List at 0.5 SUI
curl -X POST http://localhost:3000/api/list \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "0x789abc...",
    "price": 500000000
  }'

# List at 5 SUI
curl -X POST http://localhost:3000/api/list \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "0x789abc...",
    "price": 5000000000
  }'
```

### 6. Buy NFT

```bash
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "0x789abc..."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "NFT purchased successfully",
  "data": {
    "digest": "0x456def...",
    "effects": {...},
    "events": [...]
  }
}
```

## Complete Workflow Example

### Step 1: Check Initial Stats

```bash
curl http://localhost:3000/api/stats
```

### Step 2: Mint an NFT

```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunset Beach",
    "description": "Beautiful sunset at the beach",
    "url": "https://picsum.photos/400"
  }'
```

**Save the NFT ID from the response!**

### Step 3: Wait for Confirmation

```bash
# Wait 3-5 seconds for blockchain confirmation
sleep 5
```

### Step 4: List the NFT

```bash
# Replace NFT_ID with the ID from step 2
curl -X POST http://localhost:3000/api/list \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "NFT_ID_HERE",
    "price": 2000000000
  }'
```

### Step 5: View Listings

```bash
curl http://localhost:3000/api/listings
```

You should see your NFT listed!

### Step 6: Buy the NFT

```bash
curl -X POST http://localhost:3000/api/buy \
  -H "Content-Type: application/json" \
  -d '{
    "nftId": "NFT_ID_HERE"
  }'
```

### Step 7: Check Updated Stats

```bash
curl http://localhost:3000/api/stats
```

You should see:
- Total mints increased by 1
- Total sales increased by 1
- Total volume increased by 2 SUI

## Using jq for Pretty Output

If you have `jq` installed, pipe responses for better formatting:

```bash
curl -s http://localhost:3000/api/stats | jq '.'

curl -s http://localhost:3000/api/listings | jq '.data.listings'

curl -s http://localhost:3000/api/listings | jq '.data.stats'
```

## Testing Script

Use the automated testing script:

```bash
./test-api.sh
```

Or with a custom URL:

```bash
./test-api.sh http://your-server:3000
```

## Error Responses

### Invalid Request

```json
{
  "success": false,
  "error": "Missing required fields",
  "message": "name, description, and url are required"
}
```

### NFT Not Listed

```json
{
  "success": false,
  "error": "NFT not listed",
  "message": "This NFT is not currently listed for sale"
}
```

### Insufficient Balance

```json
{
  "success": false,
  "error": "Failed to buy NFT",
  "message": "Insufficient balance"
}
```

## Explorer Links

After any transaction, use the transaction digest to view on Sui Explorer:

```
https://suiexplorer.com/txblock/DIGEST_HERE?network=testnet
```

Example:
```
https://suiexplorer.com/txblock/0x123abc...?network=testnet
```

## Tips

1. **Wait between operations**: Allow 2-3 seconds for blockchain confirmation
2. **Save NFT IDs**: Keep track of minted NFT IDs for listing/buying
3. **Check balances**: Ensure you have enough SUI for gas fees
4. **Monitor logs**: Watch backend console for detailed operation logs
5. **Use explorer**: Verify all transactions on Sui Explorer

## Troubleshooting

### "Failed to mint NFT"
- Check backend has sufficient SUI balance
- Verify PACKAGE_ID and REGISTRY_ID in .env
- Check backend logs for detailed error

### "NFT not listed"
- Ensure NFT was successfully listed (check /api/listings)
- Wait a few seconds after listing
- Verify NFT ID is correct

### "Connection refused"
- Ensure backend is running (`npm run dev`)
- Check PORT in .env (default: 3000)
- Verify no other service is using the port

## Advanced: Using Postman

Import these endpoints into Postman:

**Collection Variables:**
- `base_url`: `http://localhost:3000`
- `nft_id`: (set after minting)

Create requests for each endpoint using the examples above.
