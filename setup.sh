#!/bin/bash

set -e

echo "🚀 EigenStream Setup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi

echo "✅ npm $(npm --version) found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker not found. Installing Docker..."
    echo ""
    echo "Please install Docker manually:"
    echo "  macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "  Linux: https://docs.docker.com/engine/install/"
    echo ""
    echo "After installing Docker, run this script again."
    exit 1
fi

echo "✅ Docker $(docker --version) found"

# Check FFmpeg (optional for local testing)
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg found"
else
    echo "⚠️  FFmpeg not found (optional for local testing)"
    echo "   Install with: brew install ffmpeg (macOS)"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install TEE backend dependencies
echo "Installing TEE backend..."
cd tee-backend
npm install
cd ..
echo "✅ TEE backend dependencies installed"

# Install dashboard dependencies
echo "Installing dashboard..."
cd dashboard
npm install
cd ..
echo "✅ Dashboard dependencies installed"

echo ""
echo "⚙️  Setting up environment files..."

# Copy environment files if they don't exist
if [ ! -f tee-backend/.env ]; then
    cp tee-backend/.env.example tee-backend/.env
    echo "✅ Created tee-backend/.env"
else
    echo "⏭️  tee-backend/.env already exists"
fi

if [ ! -f dashboard/.env ]; then
    cp dashboard/.env.example dashboard/.env
    echo "✅ Created dashboard/.env"
else
    echo "⏭️  dashboard/.env already exists"
fi

# Create data directory
mkdir -p data/videos data/analysis
echo "✅ Created data directories"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the TEE backend:"
echo "   cd tee-backend && npm run dev"
echo ""
echo "2. In another terminal, start the dashboard:"
echo "   cd dashboard && npm run dev"
echo ""
echo "3. Configure your Mentra glasses to stream to:"
echo "   rtmp://localhost:1935/live/eigenstream"
echo ""
echo "4. Open the dashboard at:"
echo "   http://localhost:3000"
echo ""
echo "For deployment to EigenCompute:"
echo "   ./deploy.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
