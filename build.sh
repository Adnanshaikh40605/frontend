#!/bin/bash

# Ensure Vite has proper execution permissions
echo "Setting proper permissions for Vite binary..."
chmod +x node_modules/.bin/vite

# Create environment file for production
echo "Creating .env.production file..."
echo "VITE_API_BASE_URL=https://backend-production-49ec.up.railway.app" > .env.production
echo "VITE_MEDIA_URL=https://backend-production-49ec.up.railway.app/media/" >> .env.production
echo "VITE_USE_MOCK_API=false" >> .env.production
echo "VITE_DEBUG=false" >> .env.production

# Run the build
echo "Starting build process..."
npm run build

echo "Build completed successfully!" 