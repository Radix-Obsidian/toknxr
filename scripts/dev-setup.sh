#!/bin/bash

# TokNxr Development Setup Script
# Sets up the development environment

echo "🚀 Setting up TokNxr development environment..."

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node --version)"
    echo "Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js version: $(node --version)"

# Check npm version
echo "Checking npm version..."
NPM_VERSION=$(npm --version | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 10 ]; then
    echo "❌ npm version 10 or higher is required. Current version: $(npm --version)"
    echo "Please update npm: npm install -g npm@latest"
    exit 1
fi
echo "✅ npm version: $(npm --version)"

# Install main dependencies
echo "Installing main dependencies..."
npm install

# Install CLI dependencies
echo "Installing CLI dependencies..."
npm install --prefix toknxr-cli

# Supabase is used instead of Firebase, no CLI installation needed

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your Supabase credentials"
fi

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit"
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Start development servers:"
echo "   npm run dev          # Web app (http://localhost:3000)"
echo "   npm run start --prefix toknxr-cli  # CLI proxy (http://localhost:8787)"
echo ""
echo "3. Run tests:"
echo "   npm test"
echo ""
echo "4. Format code:"
echo "   npm run format"