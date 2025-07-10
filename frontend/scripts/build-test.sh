#!/bin/bash

echo "🔥 Testing Optimized Build"
echo "========================="

# Backup current package.json
cp package.json package.json.backup.test

# Use minimal dependencies temporarily  
cp package-test-optimized.json package.json

echo "📦 Installing minimal dependencies..."
npm install --silent --legacy-peer-deps || {
  echo "❌ Installation failed"
  mv package.json.backup.test package.json
  exit 1
}

echo "🏗️ Building with optimized config..."
npm run build-optimized || {
  echo "❌ Build failed"
  mv package.json.backup.test package.json
  exit 1
}

# Check build output
if [ -d "dist" ]; then
  echo "✅ Build succeeded"
  echo "📊 Bundle analysis:"
  du -sh dist/
  echo "📄 Generated files:"
  ls -la dist/assets/ | head -10
else
  echo "❌ No dist folder generated"
fi

# Restore original package.json
mv package.json.backup.test package.json

echo "✅ Test completed"
