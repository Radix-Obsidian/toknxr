# TokNXR - AI Usage Analytics & Cost Tracking

🚀 **One Command Setup** - Track AI usage across all major providers with comprehensive analytics, cost monitoring, and code quality analysis.

## 🔥 Quick Start (ONE COMMAND!)

### Option 1: Ultimate One-Command Setup (Recommended)
```bash
# From the my-first-mvp directory, run:
./toknxr-cli/start.sh
```
This single command does **EVERYTHING**:
- ✅ Sets up all configuration files
- ✅ Creates environment variables template
- ✅ Starts the server with all 5 providers
- ✅ Opens your AI analytics dashboard

### Option 2: NPM Commands
```bash
# 1. Navigate to the toknxr-cli directory
cd toknxr-cli

# 2. One command setup and launch (does everything!)
npm run launch

# 3. Or use the alias:
npm run go
```

### Option 3: Manual Setup (if you prefer)
```bash
cd toknxr-cli
npm run quickstart  # Sets up everything
# Add your API keys to .env file
npm start          # Start tracking
```

**That's it!** 🎉 Your AI usage analytics dashboard will be available at `http://localhost:8788/dashboard`

## 📦 What's Included

✅ **5 AI Providers** with full configuration support:
- **Ollama-Llama3** (Local AI - Free)
- **Gemini-Pro** (Google AI - Paid)
- **Gemini-Free** (Google AI - Free tier)
- **OpenAI-GPT4** (OpenAI - Paid)
- **Anthropic-Claude** (Claude - Paid)

✅ **Advanced Analytics**:
- Real-time token usage tracking
- Cost monitoring and budget alerts
- Code quality analysis for coding requests
- Hallucination detection
- Effectiveness scoring

✅ **Smart Features**:
- Automatic provider routing
- Budget enforcement with alerts
- Comprehensive logging
- Web dashboard for visualization

## 🔧 Setup Details

### Environment Variables (.env file)
```bash
# Required: Google AI API Key (for Gemini models)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Anthropic Claude API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Webhook for budget alerts
WEBHOOK_URL=https://your-webhook-url.com/alerts
```

### API Provider Endpoints

Once running, your AI providers will be available at:

| Provider | Endpoint | Status |
|----------|----------|---------|
| **Ollama-Llama3** | `http://localhost:8788/ollama` | ✅ Ready |
| **Gemini-Pro** | `http://localhost:8788/gemini` | ✅ Ready |
| **Gemini-Free** | `http://localhost:8788/gemini-free` | ✅ Ready |
| **OpenAI-GPT4** | `http://localhost:8788/openai` | ✅ Ready |
| **Anthropic-Claude** | `http://localhost:8788/anthropic` | ✅ Ready |

## 💡 Usage Examples

### Using with curl
```bash
# Test Gemini-Free (no API key needed for testing)
curl -X POST http://localhost:8788/gemini-free \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello, world!"}]}]}'

# Test with your own API key for full access
curl -X POST http://localhost:8788/gemini \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Write a Python function"}]}]}'
```

### Using with JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:8788/gemini-free', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Your prompt here' }] }]
  })
});
const data = await response.json();
```

### Using with Python
```python
import requests

response = requests.post('http://localhost:8788/gemini-free', json={
    'contents': [{'parts': [{'text': 'Your prompt here'}]}]
})
result = response.json()
```

## 📊 Analytics & Monitoring

### View Usage Statistics
```bash
# View token usage and cost statistics
npm run cli stats

# Analyze code quality from coding requests
npm run cli code-analysis

# Check for AI hallucinations
npm run cli hallucination-analysis
```

### Dashboard Access
- **Main Dashboard**: `http://localhost:8788/dashboard`
- **Health Check**: `http://localhost:8788/health`
- **API Stats**: `http://localhost:8788/api/stats`

## 🛠️ Advanced Configuration

### Budget Management
The system includes intelligent budget management:

```bash
# Initialize budget policies
npm run cli policy:init

# Monthly limits (configurable in toknxr.policy.json):
# - Total: $50/month across all providers
# - Gemini-Pro: $30/month
# - Gemini-Free: $10/month
# - OpenAI-GPT4: $20/month
# - Anthropic-Claude: $15/month
# - Ollama-Llama3: $0/month (free)
```

### Custom Configuration
Edit `toknxr.config.json` to:
- Add new AI providers
- Modify token mapping
- Update API endpoints
- Configure authentication

## 🔍 Troubleshooting

### Common Issues

**Port 8788 already in use:**
```bash
# Kill existing process
pkill -f "npm run start"
# Then restart
npm start
```

**API key not working:**
- Verify your API keys in the `.env` file
- Check that keys have the correct permissions
- Test keys directly with the provider's API

**Ollama not available:**
- Ensure Ollama is running: `ollama serve`
- Check that it's accessible at `http://localhost:11434`

### Getting Help
```bash
# View all available commands
npm run cli --help

# Check available Gemini models
npm run cli models

# Test direct API calls (bypassing proxy)
npm run cli call --model models/gemini-1.5-flash --prompt "Hello"
```

## 🚀 Production Deployment

For production use:

1. **Secure your API keys** using your platform's secret management
2. **Set up proper logging** and monitoring
3. **Configure webhook alerts** for budget limits
4. **Use a process manager** like PM2 for stability
5. **Set up reverse proxy** with proper CORS configuration

## 📈 What's Tracked

For every AI request, TokNXR captures:

- **Token Usage**: Prompt, completion, and total tokens
- **Cost Calculation**: Real-time cost in USD
- **Provider Info**: Which AI model was used
- **Code Quality**: Syntax validation, readability, structure
- **Effectiveness**: How well the AI understood your request
- **Hallucinations**: Detection of potential AI fabrications
- **Business Impact**: Time waste and quality degradation metrics

## 🤝 Contributing

We welcome contributions! Areas where help is needed:

- Additional AI provider integrations
- Enhanced analytics and visualizations
- Performance optimizations
- Testing and documentation

---

**Made with ❤️ for AI developers who want to track and optimize their AI usage**
