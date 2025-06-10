#!/bin/bash

# Ensure Vite has proper execution permissions
echo "Setting proper permissions for Vite binary..."
chmod +x node_modules/.bin/vite

# Create environment file for production
echo "Creating .env.production file..."
echo "VITE_API_URL=https://web-production-2f30.up.railway.app" > .env.production

# Run the build
echo "Starting build process..."
npm run build

echo "Build completed successfully!" 