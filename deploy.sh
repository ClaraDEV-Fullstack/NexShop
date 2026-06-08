#!/bin/bash

# =============================================================================
# NEXSHOP Production Deployment Script
# =============================================================================

set -e  # Exit on error

echo "🚀 Starting NEXSHOP Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo "Please copy .env.example to .env.production and configure it."
    exit 1
fi

echo -e "${YELLOW}📦 Loading environment variables...${NC}"
export $(cat .env.production | grep -v '#' | xargs)

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down

echo -e "${YELLOW}🔨 Building production images...${NC}"
docker-compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}🚀 Starting production containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

echo -e "${YELLOW}📊 Checking container status...${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "${YELLOW}🔍 Checking backend health...${NC}"
if curl -s http://localhost/api/health/ | grep -q "healthy"; then
    echo -e "${GREEN}✅ Backend is healthy!${NC}"
else
    echo -e "${RED}⚠️ Backend health check failed${NC}"
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📌 Your application is now running at:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api/"
echo "   Admin Panel: http://localhost/admin/"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "   Stop: docker-compose -f docker-compose.prod.yml down"
echo "   Restart: docker-compose -f docker-compose.prod.yml restart"