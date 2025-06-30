#!/usr/bin/env bash

echo "🚀 Starting the development server and testing..."

# Start the dev server in the background
cd "d:/full_JavaSricpt/test-project/rupomoti"
pnpm dev &
DEV_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Test the APIs
echo "🧪 Testing APIs..."

# Test simple endpoint
echo "1. Testing simple endpoint..."
curl -s "http://localhost:3000/api/test-simple" | jq '.'

echo ""
echo "2. Testing debug orders endpoint..."
curl -s "http://localhost:3000/api/debug-orders" | jq '.'

echo ""
echo "3. Testing admin orders endpoint..."
curl -s "http://localhost:3000/api/admin/orders?status=active&page=1&limit=5" | jq '.'

# Kill the dev server
kill $DEV_PID

echo "✅ Tests completed!"
