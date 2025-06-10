#!/bin/bash
# Script to clean and reinstall node dependencies

echo "🧹 Cleaning up node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml
rm -f bun.lockb

echo "📦 Installing dependencies..."
# Uncomment the package manager you're using:

# For npm
npm install --legacy-peer-deps

# For yarn
# yarn install

# For pnpm
# pnpm install

# For bun
# bun install

# For Expo projects, you might want to clear the cache too
# npx expo start --clear

echo "✅ Done! Dependencies reinstalled successfully."