#!/bin/bash

# GradeUpNow Deployment Pre-Check Script
# Run this before deploying to catch common issues

echo "🔍 GradeUpNow Deployment Pre-Check"
echo "===================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Check 1: Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js version: $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js version too old: $(node -v). Need v18+"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 2: Backend dependencies
echo "📦 Checking backend dependencies..."
cd backend
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Backend dependencies not installed. Run: cd backend && npm install"
    ISSUES=$((ISSUES+1))
fi

# Check 3: Backend .env
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env file exists"
    
    # Check for required variables
    required_vars=("MONGODB_URI" "SUPABASE_URL" "SUPABASE_ANON_KEY" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            value=$(grep "^$var=" .env | cut -d'=' -f2)
            if [ "$value" != "" ] && [[ ! "$value" =~ ^(your_|change_this) ]]; then
                echo -e "${GREEN}  ✓${NC} $var is set"
            else
                echo -e "${RED}  ✗${NC} $var has placeholder value"
                ISSUES=$((ISSUES+1))
            fi
        else
            echo -e "${RED}  ✗${NC} $var is missing"
            ISSUES=$((ISSUES+1))
        fi
    done
else
    echo -e "${RED}✗${NC} Backend .env file missing. Copy from .env.example"
    ISSUES=$((ISSUES+1))
fi
cd ..
echo ""

# Check 4: Frontend dependencies
echo "📦 Checking frontend dependencies..."
cd GradeUpNow
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Frontend dependencies not installed. Run: cd GradeUpNow && npm install"
    ISSUES=$((ISSUES+1))
fi

# Check 5: Frontend .env
if [ -f ".env.production" ] || [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env file exists"
    
    ENV_FILE=".env.production"
    [ ! -f "$ENV_FILE" ] && ENV_FILE=".env"
    
    required_vars=("VITE_SUPABASE_URL" "VITE_SUPABASE_ANON_KEY" "VITE_API_URL")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" "$ENV_FILE"; then
            value=$(grep "^$var=" "$ENV_FILE" | cut -d'=' -f2)
            if [ "$value" != "" ] && [[ ! "$value" =~ ^(your_|http://localhost) ]]; then
                echo -e "${GREEN}  ✓${NC} $var is set"
            else
                echo -e "${YELLOW}  ⚠${NC} $var might need updating for production"
            fi
        else
            echo -e "${RED}  ✗${NC} $var is missing"
            ISSUES=$((ISSUES+1))
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} Frontend .env file missing. Create .env.production for deployment"
fi
cd ..
echo ""

# Check 6: Git status
echo "🔄 Checking Git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "${YELLOW}⚠${NC} You have uncommitted changes:"
        git status --short
        echo ""
        echo "   Commit changes before deploying for version tracking"
    fi
    
    BRANCH=$(git branch --show-current)
    echo -e "${GREEN}✓${NC} Current branch: $BRANCH"
else
    echo -e "${RED}✗${NC} Not a git repository"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 7: Railway config
echo "🚂 Checking Railway configuration..."
if [ -f "backend/railway.json" ]; then
    echo -e "${GREEN}✓${NC} railway.json exists"
else
    echo -e "${RED}✗${NC} backend/railway.json missing"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 8: Vercel config
echo "▲ Checking Vercel configuration..."
if [ -f "GradeUpNow/vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json exists"
    
    # Check for domain configuration
    if grep -q "gradeupnow.app" GradeUpNow/vercel.json; then
        echo -e "${GREEN}✓${NC} Custom domain configured in vercel.json"
    else
        echo -e "${YELLOW}⚠${NC} Custom domain not in vercel.json"
    fi
else
    echo -e "${RED}✗${NC} GradeUpNow/vercel.json missing"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Check 9: CORS configuration
echo "🌐 Checking CORS configuration..."
if grep -q "gradeupnow.app" backend/server.js; then
    echo -e "${GREEN}✓${NC} Production domains in CORS config"
else
    echo -e "${RED}✗${NC} Production domains missing from CORS config"
    ISSUES=$((ISSUES+1))
fi
echo ""

# Summary
echo "===================================="
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your changes: git add . && git commit -m 'Ready for deployment' && git push"
    echo "2. Deploy backend on Railway: https://railway.app"
    echo "3. Deploy frontend on Vercel: https://vercel.com"
    echo "4. Follow DEPLOYMENT_GUIDE.md for detailed steps"
else
    echo -e "${RED}✗ Found $ISSUES issue(s). Fix them before deploying.${NC}"
    exit 1
fi
