#!/bin/bash

# Sui NFT Marketplace Deployment Script
# This script helps deploy the smart contract and configure the backend

set -e

echo "🚀 Sui NFT Marketplace Deployment Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Sui CLI is installed
if ! command -v sui &> /dev/null; then
    echo -e "${RED}❌ Sui CLI not found. Please install it first.${NC}"
    echo "Visit: https://docs.sui.io/build/install"
    exit 1
fi

echo -e "${GREEN}✅ Sui CLI found${NC}"
echo ""

# Check network
CURRENT_ENV=$(sui client active-env)
echo "📡 Current Sui environment: $CURRENT_ENV"

if [ "$CURRENT_ENV" != "testnet" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not on testnet!${NC}"
    read -p "Switch to testnet? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sui client switch --env testnet
        echo -e "${GREEN}✅ Switched to testnet${NC}"
    else
        echo "Continuing with current environment..."
    fi
fi

# Check balance
echo ""
echo "💰 Checking balance..."
sui client gas

echo ""
read -p "Do you have enough SUI for deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Get testnet SUI from faucet:${NC}"
    echo "1. Join Sui Discord: https://discord.gg/sui"
    echo "2. Use #testnet-faucet channel"
    echo "3. Or run: sui client faucet"
    exit 1
fi

# Build the contract
echo ""
echo "🔨 Building Move contract..."
cd contract

if sui move build; then
    echo -e "${GREEN}✅ Contract built successfully${NC}"
else
    echo -e "${RED}❌ Contract build failed${NC}"
    exit 1
fi

# Deploy the contract
echo ""
echo "📤 Deploying contract to testnet..."
echo "This may take a few moments..."
echo ""

DEPLOY_OUTPUT=$(sui client publish --gas-budget 100000000 --json)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Contract deployed successfully!${NC}"
    echo ""

    # Parse package ID and registry ID from JSON output
    PACKAGE_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.type=="published") | .packageId')
    REGISTRY_ID=$(echo $DEPLOY_OUTPUT | jq -r '.objectChanges[] | select(.objectType | contains("MarketplaceRegistry")) | .objectId')

    if [ -z "$PACKAGE_ID" ] || [ "$PACKAGE_ID" = "null" ]; then
        echo -e "${YELLOW}⚠️  Could not automatically extract Package ID${NC}"
        echo "Please manually extract from output and update .env"
        echo ""
        echo "$DEPLOY_OUTPUT" | jq '.'
    else
        echo -e "${GREEN}📦 Package ID: $PACKAGE_ID${NC}"
        echo -e "${GREEN}🏪 Registry ID: $REGISTRY_ID${NC}"
        echo ""

        # Create .env file
        cd ../backend

        if [ -f .env ]; then
            echo -e "${YELLOW}⚠️  .env file already exists${NC}"
            read -p "Overwrite .env file? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Skipping .env creation. Please update manually:"
                echo "PACKAGE_ID=$PACKAGE_ID"
                echo "REGISTRY_ID=$REGISTRY_ID"
                exit 0
            fi
        fi

        # Get private key
        echo ""
        echo "🔑 To get your private key, run:"
        echo "   sui keytool export --key-identity <your-address>"
        echo ""
        read -p "Enter your private key (or press Enter to skip): " PRIVATE_KEY

        # Create .env file
        cat > .env << EOF
# Sui Network Configuration
PACKAGE_ID=$PACKAGE_ID
REGISTRY_ID=$REGISTRY_ID

# Private key for signing transactions
PRIVATE_KEY=${PRIVATE_KEY:-your_private_key_here}

# Server Configuration
PORT=3000
EOF

        echo -e "${GREEN}✅ .env file created${NC}"
        echo ""

        if [ -z "$PRIVATE_KEY" ]; then
            echo -e "${YELLOW}⚠️  Don't forget to add your PRIVATE_KEY to backend/.env${NC}"
        fi
    fi

    echo ""
    echo "=========================================="
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "=========================================="
    echo ""
    echo "Next steps:"
    echo "1. Update backend/.env with your private key (if not done)"
    echo "2. cd backend && npm install"
    echo "3. npm run dev"
    echo "4. Test with: curl http://localhost:3000/api/stats"
    echo ""
    echo "View your contract on Sui Explorer:"
    echo "https://suiexplorer.com/object/$PACKAGE_ID?network=testnet"
    echo ""

else
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi
