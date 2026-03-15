#!/bin/bash

echo "🚀 Starting ULTRA-DEEP Pickolo Integrity Guard..."

# 1. Unit Tests
echo "🧪 Running Unit Tests..."
npx vitest run
if [ $? -ne 0 ]; then
  echo "❌ Unit Tests FAILED."
  exit 1
fi
echo "✅ Unit Tests Passed."

# 2. Build Check
echo "📦 Running Build Check..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build FAILED."
  exit 1
fi
echo "✅ Build Passed."

# 3. Component Rendering Check
echo "🌐 Starting temporary server for Deep Health Check..."
pkill -f "next" || true
npm run dev -- -p 3099 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server
sleep 15

# 4. Check actual HTML content for core components using standard arrays
ROUTES=("/" "/profile" "/schedule" "/leaderboard")
MARKERS=("Search by facility name" "Player Profile Page Engine" "Schedule Analytics Engine" "Pickolo Community Hall of Fame Engine")

for i in "${!ROUTES[@]}"; do
  route="${ROUTES[$i]}"
  marker="${MARKERS[$i]}"
  
  echo "🔍 Verifying $route..."
  BODY=$(curl -s http://localhost:3099$route)
  
  if echo "$BODY" | grep -q "$marker"; then
    echo "✅ Route $route rendered correctly."
  else
    echo "❌ Route $route FAILED verification. Marker '$marker' not found."
    kill $SERVER_PID
    exit 1
  fi
done

# Cleanup & Final Start
echo "🧹 Cleaning up and starting final server on port 3000..."
kill $SERVER_PID
pkill -f "next" || true
nohup npm run dev > pickolo_final.log 2>&1 &

echo "🌟 ULTRA-DEEP INTEGRITY GUARD PASSED. Project is stable on http://localhost:3000"
exit 0
