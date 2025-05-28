#!/bin/bash

# Ensure proper permissions for executables
echo "Setting permissions for node_modules binaries..."
chmod +x ./node_modules/.bin/*

# Create environment file if it doesn't exist
if [ ! -f .env.production ]; then
  echo "Creating .env.production file..."
  echo "VITE_API_URL=https://web-production-2f30.up.railway.app" > .env.production
fi

# Run the build
echo "Running build..."
npm run build

echo "Build completed successfully!" 