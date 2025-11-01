#!/bin/bash

# Quick setup script for existing "myhub-new" Cloudflare tunnel
# Tunnel ID: 143de656-3edc-4cfe-9463-50fb6b354318

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

TUNNEL_ID="143de656-3edc-4cfe-9463-50fb6b354318"
TUNNEL_NAME="myhub-new"

echo -e "${BLUE}🌐 Configuring existing Cloudflare tunnel: ${TUNNEL_NAME}${NC}"
echo "Tunnel ID: ${TUNNEL_ID}"
echo ""

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}Step 1: Get Credentials from Cloudflare Dashboard${NC}"
echo "=========================================="
echo ""
echo "The tunnel 'myhub-new' already exists in your Cloudflare account."
echo "You need to download the credentials file:"
echo ""
echo "1. Go to: https://one.dash.cloudflare.com/"
echo "2. Navigate to: Networks → Tunnels"
echo "3. Click on tunnel: ${GREEN}myhub-new${NC}"
echo "4. Click 'Configure' button"
echo "5. Look for 'Configure using a config file' section"
echo "6. Download the credentials file OR copy these values:"
echo "   - AccountTag"
echo "   - TunnelSecret"
echo "   - TunnelID (should be: ${TUNNEL_ID})"
echo ""
echo "Option A: Download credentials file (recommended)"
echo "Option B: Manually enter credentials"
echo ""
read -p "Choose option (A/B) [default: A]: " OPTION
OPTION=${OPTION:-A}

if [ "${OPTION^^}" = "A" ]; then
    echo ""
    echo "After downloading the credentials file:"
    echo "1. Save it as: cloudflare-credentials.json"
    echo "2. Place it in the project root: $(pwd)/"
    echo ""
    read -p "Press Enter when credentials file is in place..."
    
    if [ ! -f "cloudflare-credentials.json" ]; then
        echo -e "${RED}Error: cloudflare-credentials.json not found${NC}"
        exit 1
    fi
    
    # Verify and update tunnel name if needed
    if command -v jq &> /dev/null; then
        CREDS_TUNNEL_ID=$(jq -r '.TunnelID' cloudflare-credentials.json 2>/dev/null || echo "")
        
        if [ "$CREDS_TUNNEL_ID" != "$TUNNEL_ID" ]; then
            echo -e "${YELLOW}⚠ Warning: Tunnel ID mismatch${NC}"
            echo "Expected: $TUNNEL_ID"
            echo "Found: $CREDS_TUNNEL_ID"
            read -p "Continue anyway? (y/n): " CONTINUE
            if [ "${CONTINUE^^}" != "Y" ]; then
                exit 1
            fi
        fi
        
        # Update tunnel name
        jq ".TunnelName = \"${TUNNEL_NAME}\"" cloudflare-credentials.json > cloudflare-credentials.json.tmp
        mv cloudflare-credentials.json.tmp cloudflare-credentials.json
        echo -e "${GREEN}✓ Credentials file configured${NC}"
    else
        echo -e "${YELLOW}⚠ jq not installed. Credentials file saved but not verified${NC}"
    fi
    
    chmod 600 cloudflare-credentials.json
    echo -e "${GREEN}✓ Credentials file secured${NC}"
    
elif [ "${OPTION^^}" = "B" ]; then
    echo ""
    read -p "Enter Account Tag: " ACCOUNT_TAG
    read -p "Enter Tunnel Secret (base64): " TUNNEL_SECRET
    read -p "Enter Tunnel ID [default: ${TUNNEL_ID}]: " ENTERED_TUNNEL_ID
    ENTERED_TUNNEL_ID=${ENTERED_TUNNEL_ID:-$TUNNEL_ID}
    
    cat > cloudflare-credentials.json << EOF
{
  "AccountTag": "${ACCOUNT_TAG}",
  "TunnelSecret": "${TUNNEL_SECRET}",
  "TunnelID": "${ENTERED_TUNNEL_ID}",
  "TunnelName": "${TUNNEL_NAME}"
}
EOF
    
    chmod 600 cloudflare-credentials.json
    echo -e "${GREEN}✓ Credentials file created${NC}"
else
    echo -e "${RED}Invalid option${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Configure Domain${NC}"
echo "==================="
echo ""
read -p "Enter your domain (e.g., developer.epildevconnect.uk): " DOMAIN

if [ -z "$DOMAIN" ]; then
    DOMAIN="developer.epildevconnect.uk"
    echo -e "${YELLOW}Using default domain: $DOMAIN${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Update Environment Variables${NC}"
echo "================================"
echo ""

# Update or create .env file
if [ -f ".env" ]; then
    if grep -q "^CLOUDFLARE_TUNNEL_ID=" .env; then
        sed -i "s|^CLOUDFLARE_TUNNEL_ID=.*|CLOUDFLARE_TUNNEL_ID=${TUNNEL_ID}|" .env
    else
        echo "" >> .env
        echo "# Cloudflare Tunnel Configuration" >> .env
        echo "CLOUDFLARE_TUNNEL_ID=${TUNNEL_ID}" >> .env
    fi
    
    if grep -q "^CLOUDFLARE_DOMAIN=" .env; then
        sed -i "s|^CLOUDFLARE_DOMAIN=.*|CLOUDFLARE_DOMAIN=${DOMAIN}|" .env
    else
        echo "CLOUDFLARE_DOMAIN=${DOMAIN}" >> .env
    fi
    
    echo -e "${GREEN}✓ .env file updated${NC}"
else
    echo -e "${YELLOW}⚠ .env file not found. Creating template...${NC}"
    cat >> .env << EOF

# Cloudflare Tunnel Configuration
CLOUDFLARE_TUNNEL_ID=${TUNNEL_ID}
CLOUDFLARE_DOMAIN=${DOMAIN}
EOF
    echo -e "${GREEN}✓ .env template created${NC}"
fi

echo ""
echo -e "${BLUE}Step 4: Configure DNS Routes in Cloudflare${NC}"
echo "========================================"
echo ""
echo "Now configure the tunnel routes in Cloudflare Dashboard:"
echo ""
echo "1. Go to: Networks → Tunnels → myhub-new → Configure"
echo "2. Click: 'Public Hostname' tab"
echo "3. Add these routes (if not already present):"
echo ""
echo "   Route 1 - Frontend:"
echo "   - Subdomain: $(echo $DOMAIN | cut -d. -f1)"
echo "   - Domain: $(echo $DOMAIN | cut -d. -f2-)"
echo "   - Service Type: HTTP"
echo "   - Service URL: http://localhost:1500"
echo ""
echo "   Route 2 - API:"
echo "   - Subdomain: $(echo $DOMAIN | cut -d. -f1)"
echo "   - Domain: $(echo $DOMAIN | cut -d. -f2-)"
echo "   - Path: /api/*"
echo "   - Service Type: HTTP"
echo "   - Service URL: http://localhost:1600"
echo ""
echo "   Route 3 - Auth:"
echo "   - Subdomain: $(echo $DOMAIN | cut -d. -f1)"
echo "   - Domain: $(echo $DOMAIN | cut -d. -f2-)"
echo "   - Path: /auth/*"
echo "   - Service Type: HTTP"
echo "   - Service URL: http://localhost:1600"
echo ""
echo "   Route 4 - MyHub (subdirectory):"
echo "   - Subdomain: $(echo $DOMAIN | cut -d. -f1)"
echo "   - Domain: $(echo $DOMAIN | cut -d. -f2-)"
echo "   - Path: /myhub/*"
echo "   - Service Type: HTTP"
echo "   - Service URL: http://localhost:1500"
echo ""
read -p "Press Enter when DNS routes are configured..."

echo ""
echo -e "${BLUE}Step 5: Update .gitignore${NC}"
echo "==================="
echo ""

if [ -f ".gitignore" ]; then
    if ! grep -q "cloudflare-credentials.json" .gitignore; then
        echo "" >> .gitignore
        echo "# Cloudflare Tunnel credentials" >> .gitignore
        echo "cloudflare-credentials.json" >> .gitignore
        echo -e "${GREEN}✓ .gitignore updated${NC}"
    fi
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Tunnel Configuration Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "Configuration Summary:"
echo "  - Tunnel Name: ${TUNNEL_NAME}"
echo "  - Tunnel ID: ${TUNNEL_ID}"
echo "  - Domain: ${DOMAIN}"
echo "  - Credentials: cloudflare-credentials.json"
echo ""
echo "Next steps:"
echo "1. Run deployment: ./deploy.sh"
echo "   OR manually: docker-compose up -d"
echo ""
echo "2. Check tunnel logs:"
echo "   docker-compose logs -f cloudflared"
echo ""
echo "3. Verify tunnel status:"
echo "   docker-compose exec cloudflared cloudflared tunnel info"
echo ""
echo "Ready to deploy! 🚀"
echo ""


