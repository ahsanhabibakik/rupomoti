#!/bin/bash

echo "🧹 Cleaning Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

echo "📦 Installing dependencies..."
pnpm install

echo "🏗️ Building project..."
pnpm build

echo "🚀 Starting development server..."
pnpm dev
