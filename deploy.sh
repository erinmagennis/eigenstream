#!/bin/bash

set -e

echo "🚀 EigenStream Deployment Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if eigenx is installed
if ! command -v eigenx &> /dev/null; then
    echo "📥 Installing EigenX CLI..."
    curl -fsSL https://tools.eigencloud.xyz | bash
    echo "✅ EigenX CLI installed"
    echo ""
    echo "Please run this script again to continue deployment."
    exit 0
fi

echo "✅ EigenX CLI found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"
echo ""

# Prompt for Docker registry username
read -p "Enter your Docker Hub username: " DOCKER_USERNAME

if [ -z "$DOCKER_USERNAME" ]; then
    echo "❌ Username required"
    exit 1
fi

IMAGE_NAME="eigenstream-tee"
FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:latest"

echo ""
echo "🔨 Building Docker image..."
cd tee-backend
docker build -t $IMAGE_NAME .
echo "✅ Docker image built"

echo ""
echo "🏷️  Tagging image as $FULL_IMAGE_NAME"
docker tag $IMAGE_NAME:latest $FULL_IMAGE_NAME

echo ""
echo "📤 Pushing to Docker Hub..."
echo "   (You may need to login with: docker login)"
docker push $FULL_IMAGE_NAME || {
    echo ""
    echo "⚠️  Push failed. Please login to Docker Hub:"
    docker login
    docker push $FULL_IMAGE_NAME
}

echo "✅ Image pushed to registry"

echo ""
echo "☁️  Deploying to EigenCompute..."
eigenx app deploy $FULL_IMAGE_NAME

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deployment complete!"
echo ""
echo "Your EigenStream TEE is now running on EigenCompute."
echo ""
echo "Next steps:"
echo "1. Note the public endpoint URL from above"
echo "2. Configure your Mentra glasses RTMP endpoint:"
echo "   rtmp://[YOUR-TEE-IP]:1935/live/eigenstream"
echo ""
echo "3. Update dashboard/.env with:"
echo "   VITE_API_URL=https://[YOUR-TEE-ENDPOINT]"
echo "   VITE_WS_URL=wss://[YOUR-TEE-ENDPOINT]"
echo ""
echo "4. Deploy dashboard (or run locally)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
