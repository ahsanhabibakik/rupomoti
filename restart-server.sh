#!/bin/bash

echo "🔧 Starting development server properly..."

# Kill any existing Next.js processes
pkill -f "next dev" || true
pkill -f "node.*next" || true

# Wait a moment
sleep 2

# Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache

# Start fresh development server
echo "🚀 Starting development server..."
npm run dev
