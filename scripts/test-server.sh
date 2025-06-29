#!/bin/bash
echo "Testing the development server startup..."
cd /d/delwer/rupomoti
pnpm dev &
SERVER_PID=$!
sleep 5

echo "Checking if server is running..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Development server is running successfully"
else
    echo "❌ Development server failed to start"
fi

kill $SERVER_PID
