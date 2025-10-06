#!/bin/bash

echo "🚀 TokNXR - One Command AI Analytics Setup"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/cli.ts" ]; then
    echo "❌ Error: Please run this script from the toknxr-cli directory"
    exit 1
fi

echo "📦 Setting up TokNXR with all providers..."

# Run the setup
npm run setup

# Create .env file with demo keys for immediate testing
if [ ! -f ".env" ]; then
    echo "🔑 Creating .env file with demo configuration..."
    cat > .env << 'EOF'
# TokNXR Environment Variables
# Add your real API keys here for full functionality

# Demo mode - Replace with your actual keys
GEMINI_API_KEY=demo_key_for_testing
OPENAI_API_KEY=demo_key_for_testing
ANTHROPIC_API_KEY=demo_key_for_testing

# Optional: Webhook for budget alerts (leave empty for now)
WEBHOOK_URL=

# Optional: Custom port (default: 8788)
# PORT=8788
EOF
    echo "✅ Created .env file (please add your real API keys)"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup complete! Starting TokNXR..."
echo ""
echo "📊 Dashboard will be available at: http://localhost:8788/dashboard"
echo "🔗 API endpoints:"
echo "   • Gemini-Free: http://localhost:8788/gemini-free"
echo "   • Gemini-Pro:  http://localhost:8788/gemini"
echo "   • OpenAI:      http://localhost:8788/openai"
echo "   • Claude:      http://localhost:8788/anthropic"
echo "   • Ollama:      http://localhost:8788/ollama"
echo ""
echo "💡 To stop the server: Ctrl+C"
echo "🔄 To restart later: npm start"
echo ""

# Start the server
npm start
