#!/bin/bash

# TokNxr Cleanup Script
# Removes temporary files, caches, and development artifacts

echo "🧹 Cleaning up TokNxr project..."

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf .next/
rm -rf out/
rm -rf build/
rm -rf dist/

# Remove dependency caches
echo "Removing dependency caches..."
rm -rf node_modules/.cache/
rm -rf .npm/
rm -rf .yarn/cache/

# Remove log files
echo "Removing log files..."
rm -f *.log
rm -f *-debug.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

# Remove temporary files
echo "Removing temporary files..."
rm -rf .tmp/
rm -rf .temp/
rm -rf .cache/

# Remove OS-specific files
echo "Removing OS-specific files..."
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete
find . -name "desktop.ini" -type f -delete

# Remove IDE files (optional - uncomment if needed)
# echo "Removing IDE files..."
# rm -rf .vscode/
# rm -rf .idea/

# Remove test coverage
echo "Removing test coverage..."
rm -rf coverage/
rm -rf .nyc_output/

# Remove Firebase emulator data
echo "Removing Firebase emulator data..."
rm -rf .dataconnect/

# Clean CLI directory
echo "Cleaning CLI directory..."
cd toknxr-cli 2>/dev/null && {
    rm -rf node_modules/.cache/
    rm -f *.log
    cd ..
}

# Clean functions directory
echo "Cleaning functions directory..."
cd functions 2>/dev/null && {
    rm -rf node_modules/.cache/
    rm -f *.log
    cd ..
}

echo "✅ Cleanup complete!"
echo ""
echo "To reinstall dependencies, run:"
echo "  npm install"
echo "  npm install --prefix toknxr-cli"
echo "  npm install --prefix functions"