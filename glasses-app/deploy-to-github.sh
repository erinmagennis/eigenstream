#!/bin/bash

# Script to deploy glasses-app to GitHub

echo "🚀 Deploying glasses app to GitHub..."
echo ""

# Initialize git repo
echo "1. Initializing git repository..."
git init

# Add all files
echo "2. Adding files..."
git add .

# Create commit
echo "3. Creating commit..."
git commit -m "Initial commit - Generic Mentra glasses streaming app

- Fully configurable via config.js
- Works for any use case (security, events, sports, etc.)
- Beautiful UI with start/stop controls
- Auto-restart on errors
- HLS video streaming support"

echo ""
echo "✅ Local git repo ready!"
echo ""
echo "📝 Next steps:"
echo "1. Go to: https://github.com/new"
echo "2. Create a new repo named: eigenstream-glasses"
echo "3. Make it public or private (your choice)"
echo "4. DON'T initialize with README"
echo "5. Run these commands:"
echo ""
echo "   git branch -M main"
echo "   git remote add origin https://github.com/YOUR_USERNAME/eigenstream-glasses.git"
echo "   git push -u origin main"
echo ""
echo "6. Then go to Vercel and import the repo!"
