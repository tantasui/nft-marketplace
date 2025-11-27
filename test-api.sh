#!/bin/bash

# API Testing Script for NFT Marketplace
# Usage: ./test-api.sh [base_url]

BASE_URL=${1:-http://localhost:3000}

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 NFT Marketplace API Testing"
echo "==============================="
echo "Base URL: $BASE_URL"
echo ""

# Function to print section headers
section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4

    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Request: $method $endpoint"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
    else
        echo "Data: $data"
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}❌ Failed (HTTP $http_code)${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# Test 1: Get Stats
section "Test 1: Get Marketplace Stats"
test_endpoint "GET" "/api/stats" "" "Get marketplace statistics"

# Test 2: Get Listings (initially empty)
section "Test 2: Get All Listings"
test_endpoint "GET" "/api/listings" "" "Get all NFT listings"

# Test 3: Mint NFT
section "Test 3: Mint a New NFT"
mint_data='{
  "name": "Test NFT #1",
  "description": "This is a test NFT created via API",
  "url": "https://via.placeholder.com/400/FF6B6B/FFFFFF?text=Test+NFT+1"
}'
test_endpoint "POST" "/api/mint" "$mint_data" "Mint first NFT"

echo -e "${YELLOW}⏳ Waiting 3 seconds for blockchain confirmation...${NC}"
sleep 3

# Test 4: Mint Another NFT
section "Test 4: Mint Second NFT"
mint_data2='{
  "name": "Cool Digital Art",
  "description": "A unique piece of digital artwork",
  "url": "https://via.placeholder.com/400/4ECDC4/FFFFFF?text=Cool+Art"
}'
test_endpoint "POST" "/api/mint" "$mint_data2" "Mint second NFT"

echo -e "${YELLOW}⏳ Waiting 3 seconds for blockchain confirmation...${NC}"
sleep 3

# Test 5: Check stats after minting
section "Test 5: Stats After Minting"
test_endpoint "GET" "/api/stats" "" "Get updated stats"

# Test 6: Get listings (still empty - not listed yet)
section "Test 6: Check Listings (Should be empty)"
test_endpoint "GET" "/api/listings" "" "Get listings after minting"

# Manual listing instructions
section "📝 Manual Steps Required"
echo "To continue testing, you need to:"
echo ""
echo "1. Copy an NFT ID from the mint responses above"
echo "2. List it using:"
echo ""
echo -e "${GREEN}curl -X POST $BASE_URL/api/list \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"nftId\": \"YOUR_NFT_ID\", \"price\": 1000000000}'${NC}"
echo ""
echo "3. Buy it using:"
echo ""
echo -e "${GREEN}curl -X POST $BASE_URL/api/buy \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{\"nftId\": \"YOUR_NFT_ID\"}'${NC}"
echo ""
echo "4. Check listings and stats again to see updates"
echo ""

# Summary
section "📊 Test Summary"
echo "Completed automated tests:"
echo "  ✓ Get marketplace stats"
echo "  ✓ Get listings endpoint"
echo "  ✓ Mint NFT functionality"
echo ""
echo "Manual tests to complete:"
echo "  ○ List NFT for sale"
echo "  ○ Buy NFT"
echo "  ○ Verify ownership transfer"
echo ""
echo -e "${BLUE}Check Sui Explorer for transaction details:${NC}"
echo "https://suiexplorer.com/?network=testnet"
echo ""
