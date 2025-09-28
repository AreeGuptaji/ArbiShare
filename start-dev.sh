#!/bin/bash

# Kill any existing processes on ports 3001 and 3002
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true

echo "🚀 Starting development servers..."

# Start API server on port 3002
cd apps/api && PORT=3002 npm run dev &
API_PID=$!

# Start mini-app on port 3001
cd ../mini-app && npm run dev &
MINIAPP_PID=$!

echo "✅ API Server running on port 3002 (PID: $API_PID)"
echo "✅ Mini-app running on port 3001 (PID: $MINIAPP_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for interrupt
trap "echo '🛑 Stopping servers...'; kill $API_PID $MINIAPP_PID; exit" INT
wait
