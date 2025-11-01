#!/bin/bash

# MY HUB Deployment Script
# This script handles the complete deployment process including Cloudflare tunnel

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 MY HUB Deployment Script${NC}"
echo -e "${BLUE}===========================${NC}"
echo ""

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from template..."
    if [ -f "create-env.sh" ]; then
        echo "Run: ./create-env.sh"
        exit 1
    else
        echo -e "${RED}Error: create-env.sh not found. Please create .env manually${NC}"
        exit 1
    fi
fi

# Check if Cloudflare tunnel is configured
if [ ! -f "cloudflare-credentials.json" ]; then
    echo -e "${YELLOW}⚠ Cloudflare tunnel credentials not found${NC}"
    
    # Check if tunnel "myhub-new" exists in Cloudflare
    if command -v cloudflared &> /dev/null; then
        TUNNEL_EXISTS=$(cloudflared tunnel list 2>/dev/null | grep -i "myhub-new" || echo "")
        if [ -n "$TUNNEL_EXISTS" ]; then
            echo -e "${GREEN}✓ Found existing tunnel 'myhub-new' in Cloudflare${NC}"
            echo ""
            read -p "Do you want to configure the existing tunnel now? (y/n): " SETUP_TUNNEL
            
            if [ "${SETUP_TUNNEL^^}" = "Y" ]; then
                echo ""
                if [ -f "configure-myhub-new-tunnel.sh" ]; then
                    echo "Running tunnel configuration script..."
                    chmod +x configure-myhub-new-tunnel.sh
                    ./configure-myhub-new-tunnel.sh
                else
                    echo "Running tunnel setup script..."
                    chmod +x setup-tunnel-myhub-new.sh
                    ./setup-tunnel-myhub-new.sh
                fi
                echo ""
                echo "Press Enter to continue with deployment..."
                read
            else
                echo -e "${RED}Tunnel configuration is required for deployment${NC}"
                echo "Run: ./configure-myhub-new-tunnel.sh"
                exit 1
            fi
        else
            echo ""
            read -p "Do you want to set up Cloudflare tunnel now? (y/n): " SETUP_TUNNEL
            
            if [ "${SETUP_TUNNEL^^}" = "Y" ]; then
                echo ""
                echo "Running tunnel setup script..."
                chmod +x setup-tunnel-myhub-new.sh
                ./setup-tunnel-myhub-new.sh
                echo ""
                echo "Press Enter to continue with deployment..."
                read
            else
                echo -e "${RED}Tunnel setup is required for deployment${NC}"
                echo "Run: ./setup-tunnel-myhub-new.sh"
                exit 1
            fi
        fi
    else
        echo ""
        read -p "Do you want to set up Cloudflare tunnel now? (y/n): " SETUP_TUNNEL
        
        if [ "${SETUP_TUNNEL^^}" = "Y" ]; then
            echo ""
            if [ -f "configure-myhub-new-tunnel.sh" ]; then
                echo "Running tunnel configuration script..."
                chmod +x configure-myhub-new-tunnel.sh
                ./configure-myhub-new-tunnel.sh
            else
                echo "Running tunnel setup script..."
                chmod +x setup-tunnel-myhub-new.sh
                ./setup-tunnel-myhub-new.sh
            fi
            echo ""
            echo "Press Enter to continue with deployment..."
            read
        else
            echo -e "${RED}Tunnel setup is required for deployment${NC}"
            echo "Run: ./configure-myhub-new-tunnel.sh"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✓ Cloudflare tunnel credentials found${NC}"
    
    # Verify tunnel ID if possible
    if command -v jq &> /dev/null && [ -f "cloudflare-credentials.json" ]; then
        TUNNEL_ID=$(jq -r '.TunnelID' cloudflare-credentials.json 2>/dev/null || echo "")
        TUNNEL_NAME=$(jq -r '.TunnelName' cloudflare-credentials.json 2>/dev/null || echo "")
        
        if [ -n "$TUNNEL_ID" ] && [ "$TUNNEL_ID" != "null" ]; then
            echo -e "${GREEN}  Tunnel ID: $TUNNEL_ID${NC}"
            if [ -n "$TUNNEL_NAME" ] && [ "$TUNNEL_NAME" != "null" ]; then
                echo -e "${GREEN}  Tunnel Name: $TUNNEL_NAME${NC}"
            fi
        fi
    fi
fi

# Check Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"
echo ""

# Step 1: Build frontend
echo -e "${BLUE}Step 1: Building frontend...${NC}"
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    echo "Building production bundle..."
    npm run build
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}Error: Build failed - dist directory not found${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${YELLOW}⚠ package.json not found, skipping frontend build${NC}"
fi

echo ""

# Step 2: Build Docker images
echo -e "${BLUE}Step 2: Building Docker images...${NC}"
if docker compose version &> /dev/null; then
    docker compose build
else
    docker-compose build
fi
echo -e "${GREEN}✓ Docker images built${NC}"
echo ""

# Step 3: Stop existing containers
echo -e "${BLUE}Step 3: Stopping existing containers...${NC}"
if docker compose version &> /dev/null; then
    docker compose down 2>/dev/null || true
else
    docker-compose down 2>/dev/null || true
fi
echo -e "${GREEN}✓ Existing containers stopped${NC}"
echo ""

# Step 4: Start services
echo -e "${BLUE}Step 4: Starting services...${NC}"
if docker compose version &> /dev/null; then
    docker compose up -d
else
    docker-compose up -d
fi
echo -e "${GREEN}✓ Services started${NC}"
echo ""

# Step 5: Wait for services to be healthy
echo -e "${BLUE}Step 5: Waiting for services to be ready...${NC}"
sleep 5

# Check service health
echo "Checking service health..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:1600/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Waiting for backend... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠ Backend health check timeout. Check logs: docker-compose logs myhub${NC}"
fi

# Check tunnel
if docker compose version &> /dev/null; then
    if docker compose ps cloudflared | grep -q "Up"; then
        echo -e "${GREEN}✓ Cloudflare tunnel is running${NC}"
    else
        echo -e "${YELLOW}⚠ Cloudflare tunnel may not be running. Check logs: docker-compose logs cloudflared${NC}"
    fi
else
    if docker-compose ps cloudflared | grep -q "Up"; then
        echo -e "${GREEN}✓ Cloudflare tunnel is running${NC}"
    else
        echo -e "${YELLOW}⚠ Cloudflare tunnel may not be running. Check logs: docker-compose logs cloudflared${NC}"
    fi
fi

echo ""

# Step 6: Display status
echo -e "${BLUE}Step 6: Service Status${NC}"
echo "=================="
echo ""
if docker compose version &> /dev/null; then
    docker compose ps
else
    docker-compose ps
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Check tunnel: docker-compose logs -f cloudflared"
echo "  - Restart services: docker-compose restart"
echo "  - Stop services: docker-compose down"
echo ""
echo "To check your site:"
if grep -q "CLOUDFLARE_DOMAIN" .env; then
    DOMAIN=$(grep "^CLOUDFLARE_DOMAIN=" .env | cut -d= -f2)
    echo "  - https://${DOMAIN}"
fi
echo ""

