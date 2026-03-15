#!/bin/bash

echo "🚀 Starting DEEP Pickolo Integrity Guard..."

# 1. Unit Tests
echo "🧪 Running Unit Tests..."
npx vitest run
if [ $? -ne 0 ]; then
  echo "❌ Unit Tests FAILED. Fix logic before proceeding."
  exit 1
fi
echo "✅ Unit Tests Passed."

# 2. Build Check
echo "📦 Running Build Check..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build FAILED. Fix errors before proceeding."
  exit 1
fi
echo "✅ Build Passed."

# 3. Component Rendering Check (Body Inspection)
echo "🌐 Starting temporary server for Deep Health Check..."
pkill -f "next" || true
npm run dev -- -p 3099 > /dev/null 2>&1 &
SERVER_PID=$!

# Wait for server
sleep 15

# 4. Check actual HTML content for core components
echo "🔍 Verifying Page Content..."
BODY=$(curl -s http://localhost:3099/)

# Check for branding
if echo "$BODY" | grep -q "pickolo."; then
  echo "✅ Branding 'pickolo.' found."
else
  echo "❌ Branding MISSING. Page may have failed to render."
  kill $SERVER_PID
  exit 1
fi

# Check for search input (Hero)
if echo "$BODY" | grep -q "Search by facility name"; then
  echo "✅ Hero Section rendered correctly."
else
  echo "❌ Hero Section MISSING. Possible hydration error."
  kill $SERVER_PID
  exit 1
fi

# 5. Check sub-pages
ROUTES=("/facilities" "/schedule" "/login" "/leaderboard" "/profile")
for route in "${ROUTES[@]}"; do
  STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3099$route)
  if [ "$STATUS" -eq 200 ]; then
    echo "✅ Route $route is UP (200 OK)"
  else
    echo "❌ Route $route is DOWN (Status: $STATUS)"
    kill $SERVER_PID
    exit 1
  fi
done

# Cleanup & Final Start
echo "🧹 Cleaning up and starting final server on port 3000..."
kill $SERVER_PID
pkill -f "next" || true
nohup npm run dev > pickolo_final.log 2>&1 &

echo "🌟 DEEP INTEGRITY GUARD PASSED. Project is stable on http://localhost:3000"
exit 0
