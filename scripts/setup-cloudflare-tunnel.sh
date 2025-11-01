#!/bin/bash

# Cloudflare Tunnel Setup Script
# This script helps configure Cloudflare Tunnel for MY HUB

set -e

echo "🌐 Cloudflare Tunnel Setup for MY HUB"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from template...${NC}"
    echo "Please update .env with your configuration after setup."
fi

# Step 1: Get Tunnel ID
echo "Step 1: Cloudflare Tunnel Configuration"
echo "----------------------------------------"
echo ""
echo "To create a Cloudflare Tunnel:"
echo "1. Go to https://one.dash.cloudflare.com/"
echo "2. Navigate to Networks → Tunnels"
echo "3. Click 'Create a tunnel'"
echo "4. Select 'Cloudflared' (Docker)"
echo "5. Give it a name (e.g., 'myhub-tunnel')"
echo ""
read -p "Enter your Tunnel ID (or press Enter to skip): " TUNNEL_ID

if [ -z "$TUNNEL_ID" ]; then
    echo -e "${YELLOW}Skipping Tunnel ID setup. You can set it later in .env${NC}"
    TUNNEL_ID="your-tunnel-id-here"
fi

# Step 2: Get Tunnel Credentials
echo ""
echo "Step 2: Tunnel Credentials"
echo "---------------------------"
echo ""
echo "You need to download or create your tunnel credentials file."
echo "In Cloudflare Dashboard (Networks → Tunnels → Your Tunnel → Configure):"
echo "- You can download the credentials JSON file"
echo "- OR copy the AccountTag, TunnelSecret, and TunnelID"
echo ""

read -p "Do you want to create credentials file manually? (y/n): " CREATE_CREDS

if [ "$CREATE_CREDS" = "y" ]; then
    echo ""
    read -p "Enter Account Tag: " ACCOUNT_TAG
    read -p "Enter Tunnel Secret (base64): " TUNNEL_SECRET
    read -p "Enter Tunnel ID: " TUNNEL_ID_CREDS
    read -p "Enter Tunnel Name (e.g., 'myhub-tunnel'): " TUNNEL_NAME
    
    cat > cloudflare-credentials.json << EOF
{
  "AccountTag": "${ACCOUNT_TAG}",
  "TunnelSecret": "${TUNNEL_SECRET}",
  "TunnelID": "${TUNNEL_ID_CREDS}",
  "TunnelName": "${TUNNEL_NAME:-myhub-tunnel}"
}
EOF
    
    chmod 600 cloudflare-credentials.json
    echo -e "${GREEN}✓ Credentials file created: cloudflare-credentials.json${NC}"
else
    echo ""
    echo "Please download the credentials file from Cloudflare Dashboard"
    echo "and save it as 'cloudflare-credentials.json' in the project root"
    echo ""
    read -p "Press Enter when credentials file is in place..."
    
    if [ ! -f "cloudflare-credentials.json" ]; then
        echo -e "${RED}Error: cloudflare-credentials.json not found${NC}"
        echo "Please download it from Cloudflare Dashboard and try again"
        exit 1
    fi
    
    chmod 600 cloudflare-credentials.json
    echo -e "${GREEN}✓ Credentials file found${NC}"
fi

# Step 3: Get Domain
echo ""
echo "Step 3: Domain Configuration"
echo "-----------------------------"
read -p "Enter your domain (e.g., developer.epildevconnect.uk): " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN="developer.epildevconnect.uk"
    echo -e "${YELLOW}Using default domain: $DOMAIN${NC}"
fi

# Step 4: Update .env file
echo ""
echo "Step 4: Updating .env file"
echo "--------------------------"

# Check if variables exist in .env
if [ -f ".env" ]; then
    # Update or add CLOUDFLARE_TUNNEL_ID
    if grep -q "^CLOUDFLARE_TUNNEL_ID=" .env; then
        sed -i "s|^CLOUDFLARE_TUNNEL_ID=.*|CLOUDFLARE_TUNNEL_ID=${TUNNEL_ID}|" .env
    else
        echo "" >> .env
        echo "# Cloudflare Tunnel Configuration" >> .env
        echo "CLOUDFLARE_TUNNEL_ID=${TUNNEL_ID}" >> .env
    fi
    
    # Update or add CLOUDFLARE_DOMAIN
    if grep -q "^CLOUDFLARE_DOMAIN=" .env; then
        sed -i "s|^CLOUDFLARE_DOMAIN=.*|CLOUDFLARE_DOMAIN=${DOMAIN}|" .env
    else
        echo "CLOUDFLARE_DOMAIN=${DOMAIN}" >> .env
    fi
    
    echo -e "${GREEN}✓ .env file updated${NC}"
else
    echo -e "${YELLOW}Warning: .env file not found. Creating template...${NC}"
    cat >> .env << EOF

# Cloudflare Tunnel Configuration
CLOUDFLARE_TUNNEL_ID=${TUNNEL_ID}
CLOUDFLARE_DOMAIN=${DOMAIN}
EOF
    echo -e "${GREEN}✓ .env template created${NC}"
fi

# Step 5: Update tunnel config
echo ""
echo "Step 5: Updating tunnel configuration"
echo "--------------------------------------"

# Extract tunnel ID from credentials if possible
if [ -f "cloudflare-credentials.json" ] && command -v jq &> /dev/null; then
    CREDS_TUNNEL_ID=$(jq -r '.TunnelID' cloudflare-credentials.json 2>/dev/null || echo "")
    if [ -n "$CREDS_TUNNEL_ID" ] && [ "$CREDS_TUNNEL_ID" != "null" ]; then
        TUNNEL_ID=$CREDS_TUNNEL_ID
    fi
fi

# Update cloudflare-tunnel-config.yml
if [ -f "cloudflare-tunnel-config.yml" ]; then
    # Use a temporary file for sed (works on both macOS and Linux)
    sed -i.bak "s|tunnel: .*|tunnel: ${TUNNEL_ID}|" cloudflare-tunnel-config.yml 2>/dev/null || \
    sed -i '' "s|tunnel: .*|tunnel: ${TUNNEL_ID}|" cloudflare-tunnel-config.yml
    
    # Update domain in config
    sed -i.bak "s|hostname: .*|hostname: ${DOMAIN}|" cloudflare-tunnel-config.yml 2>/dev/null || \
    sed -i '' "s|hostname: .*|hostname: ${DOMAIN}|" cloudflare-tunnel-config.yml
    
    rm -f cloudflare-tunnel-config.yml.bak
    
    echo -e "${GREEN}✓ Tunnel configuration updated${NC}"
fi

# Step 6: Update .gitignore
echo ""
echo "Step 6: Updating .gitignore"
echo "----------------------------"

if [ -f ".gitignore" ]; then
    if ! grep -q "cloudflare-credentials.json" .gitignore; then
        echo "" >> .gitignore
        echo "# Cloudflare Tunnel credentials" >> .gitignore
        echo "cloudflare-credentials.json" >> .gitignore
        echo -e "${GREEN}✓ .gitignore updated${NC}"
    else
        echo -e "${GREEN}✓ .gitignore already includes credentials${NC}"
    fi
fi

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Configure DNS in Cloudflare Dashboard:"
echo "   - Go to Networks → Tunnels → Your Tunnel → Configure"
echo "   - Add Public Hostname for: ${DOMAIN}"
echo "   - Service URL: http://localhost:1500"
echo ""
echo "2. Add DNS record in Cloudflare (if not automatic):"
echo "   - DNS → Records → Add CNAME"
echo "   - Name: developer (or your subdomain)"
echo "   - Target: [Tunnel will show you the target]"
echo ""
echo "3. Start the services:"
echo "   docker-compose up -d"
echo ""
echo "4. Check tunnel logs:"
echo "   docker-compose logs -f cloudflared"
echo ""
echo "5. Test your site:"
echo "   curl https://${DOMAIN}"
echo ""
echo "For more details, see: docs/CLOUDFLARE_TUNNEL_SETUP.md"
echo ""

