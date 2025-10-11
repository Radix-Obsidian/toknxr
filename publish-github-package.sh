#!/bin/bash

# GitHub Package Publishing Script for TokNXR CLI
# This script helps publish the package to GitHub Package Registry

echo "🚀 TokNXR CLI - GitHub Package Publishing"
echo "=========================================="

# Check if we have the required files
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

if [ ! -d "toknxr-cli/lib" ]; then
    echo "❌ Error: Built CLI not found. Running build..."
    npm run build
fi

echo "📦 Package Information:"
echo "Name: $(grep '"name"' package.json | cut -d'"' -f4)"
echo "Version: $(grep '"version"' package.json | cut -d'"' -f4)"

echo ""
echo "🔧 Publishing Options:"
echo "1. Manual publish (requires GitHub token)"
echo "2. Create release (alternative distribution)"
echo "3. Show package info"

read -p "Choose option (1-3): " choice

case $choice in
    1)
        echo "📤 Attempting to publish to GitHub Packages..."
        echo "Note: You need to set GITHUB_TOKEN environment variable"
        echo "Get token from: https://github.com/settings/tokens"
        echo ""
        if [ -z "$GITHUB_TOKEN" ]; then
            echo "⚠️  GITHUB_TOKEN not set. Please set it first:"
            echo "export GITHUB_TOKEN=your_token_here"
            exit 1
        fi
        npm publish --registry=https://npm.pkg.github.com
        ;;
    2)
        echo "📋 Creating GitHub release..."
        echo "Package file: radix-obsidian-toknxr-cli-0.3.0.tgz"
        echo "You can upload this file to a GitHub release manually"
        echo "Go to: https://github.com/Radix-Obsidian/toknxr/releases/new"
        ;;
    3)
        echo "📋 Package Information:"
        npm pack --dry-run
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Script completed!"
echo ""
echo "📖 Installation Instructions:"
echo "For GitHub Packages:"
echo "  npm install @radix-obsidian/toknxr-cli --registry=https://npm.pkg.github.com"
echo ""
echo "For npm (already published):"
echo "  npm install -g @goldensheepai/toknxr-cli@0.3.0"