#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================
College Event Management App - Startup Script
===========================================${NC}\n"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}\n"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}\n"
fi

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${RED}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Start backend API server
echo -e "${BLUE}🚀 Starting Backend API Server...${NC}"
cd api
node index.js &
BACKEND_PID=$!
cd ..
sleep 3

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend API running on http://localhost:3000${NC}\n"
else
    echo -e "${RED}✗ Backend API failed to start${NC}\n"
    exit 1
fi

# Start Expo frontend
echo -e "${BLUE}🎨 Starting Expo Frontend...${NC}"
npx expo start &
FRONTEND_PID=$!
sleep 5

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Expo Metro Bundler running on http://localhost:8081${NC}\n"
else
    echo -e "${RED}✗ Expo Frontend failed to start${NC}\n"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo -e "${GREEN}===========================================
🎉 Both servers are running!
===========================================
Backend API:      http://localhost:3000
Expo Metro:       http://localhost:8081

Press Ctrl+C to stop both servers
===========================================${NC}\n"

# Wait for both processes
wait
