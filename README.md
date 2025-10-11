# TokNXR CLI - AI Usage Analytics & Code Quality Analysis

🚀 **Enhanced CLI Experience** - Beautiful, branded interface with comprehensive AI analytics, cost monitoring, and code quality analysis.

## 🎨 Enhanced CLI Interface

TokNXR now features a completely redesigned CLI experience with:

### ✨ **Golden Sheep AI Branding**
- Beautiful ASCII art logos and welcome messages
- Professional visual identity throughout the interface
- Contextual greetings and time-of-day messages
- Consistent color schemes and styling

### 🖥️ **Interactive Menu System**
```bash
# Launch the enhanced interactive menu
toknxr menu

# Or simply run without commands for automatic menu
toknxr
```

### 🎯 **Smart Welcome Experience**
```bash
# See the full branding and onboarding experience
toknxr welcome

# Display just the logos and branding
toknxr logo
```

### 🏥 **Enhanced System Diagnostics**
```bash
# Professional diagnostic interface with categorized results
toknxr doctor

# Visual status indicators and smart recommendations
toknxr init
```

## 🔥 Quick Start (ONE COMMAND!)

### Option 1: Ultimate One-Command Setup (Recommended)

```bash
# From the ToknXR-CLI directory, run:
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

## 🎭 See It In Action - Complete User Journey

### **Role-Play: Developer workday - Alex wants to track AI usage and optimize costs**

```bash
# Terminal opens - Alex sees welcome screen
$ toknxr

  ████████╗  ██████╗   ██╗  ██╗ ███╗   ██╗ ██╗  ██╗ ██████╗
  ╚══██╔══╝ ██╔═══██╗ ██║ ██╔╝ ████╗  ██║ ╚██╗██╔╝ ██╔══██╗
     ██║    ██║   ██║ █████╔╝  ██╔██╗ ██║  ╚███╔╝  ██████╔╝
     ██║    ██║   ██║ ██╔═██╗  ██║╚██╗██║  ██╔██╗  ██╔══██╗
     ██║    ╚██████╔╝ ██║  ██╗ ██║ ╚████║ ██╔╝ ██╗ ██║  ██║
     ╚═╝     ╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═══╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝

🐑 Powered by Golden Sheep AI
```

**Alex (thinking):** "Okay, I need to set up tracking for my OpenAI and Google AI usage. Let me configure this."

```bash
# 1. Initialize project with config and policies
$ toknxr init

Created .env
Created toknxr.config.json
Created toknxr.policy.json

$ cat toknxr.config.json
{
  "providers": [
    {
      "name": "Gemini-Pro",
      "routePrefix": "/gemini",
      "targetUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      "apiKeyEnvVar": "GEMINI_API_KEY",
      "authHeader": "x-goog-api-key",
      "tokenMapping": {
        "prompt": "usageMetadata.promptTokenCount",
        "completion": "usageMetadata.candidatesTokenCount",
        "total": "usageMetadata.totalTokenCount"
      }
    }
  ]
}

# 2. Alex sets up API key
$ echo "GEMINI_API_KEY=your_actual_key_here" >> .env
# 3. Sets budget policies
$ vim toknxr.policy.json
# Edits: monthlyUSD: 100, perProviderMonthlyUSD: {"Gemini-Pro": 50}
```

**Alex:** "Great! Now I need to authenticate so my data syncs to the dashboard."

```bash
# 4. Login to web dashboard
$ toknxr login

[Auth] Opening https://your-toknxr-app.com/cli-login
[Auth] Please authenticate in your browser...

# Alex opens browser, logs in with email/password
# CLI detects successful auth, stores token locally

[Auth] ✅ Successfully authenticated! You can now sync data to your dashboard.
```

**Alex:** "Perfect! Now let me start tracking my AI usage automatically."

```bash
# 5. Start the proxy server
$ toknxr start

[Proxy] Server listening on http://localhost:8788
[Proxy] Loaded providers: Gemini-Pro
[Proxy] ⏳ Ready to intercept and analyze your AI requests...

🐑 TokNXR is watching your AI usage...
```

**Alex (working on a coding task):** "Let me ask Gemini to write some code for me."

````bash
# 6. Alex uses their normal AI workflow, but points to proxy
$ curl "http://localhost:8788/gemini" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{"text": "Write a Python function to calculate fibonacci numbers efficiently"}]
    }]
  }'

# 7. Proxy intercepts, forwards to Gemini, analyzes response
[Proxy] Received request: POST /gemini | requestId=1234-abcd
[Proxy] Matched provider: Gemini-Pro
[Proxy] Forwarding request to https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
[Proxy] Running AI analysis pipeline... Confidence: 5.2%, Likely: false
[Proxy] Running code quality analysis... Quality: 87/100, Effectiveness: 92/100
[Proxy] Interaction successfully logged to interactions.log

# Returns the actual AI response to Alex's curl command
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "def fibonacci(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)\n    return memo[n]"
      }]
    },
    "usageMetadata": {
      "promptTokenCount": 45,
      "candidatesTokenCount": 78,
      "totalTokenCount": 123
    }
  }]
}```

**Alex:** "Nice! The proxy automatically captured that interaction. Let me check the local analytics."

```bash
# 8. Check local stats and analytics
$ toknxr stats

Token Usage Statistics

Provider: Gemini-Pro
  Total Requests: 1
  Total Tokens: 123
    - Prompt Tokens: 45
    - Completion Tokens: 78
  Cost (USD): $0.0005

Grand Totals
  Requests: 1
  Tokens: 123
    - Prompt: 45
    - Completion: 78
  Cost (USD): $0.0005

Code Quality Insights:
  Coding Requests: 1
  Avg Code Quality: 87/100
  Avg Effectiveness: 92/100

  ✅ Your AI coding setup is working well
````

**Alex:** "Sweet! Let me see more detailed analysis."

```bash
# 9. Deep dive into code analysis
$ toknxr code-analysis

AI Code Quality Analysis

Language Distribution:
  python: 1 requests

Code Quality Scores:
  Excellent (90-100): 0
  Good (75-89): 1
  Fair (60-74): 0
  Poor (0-59): 0

Effectiveness Scores (Prompt ↔ Result):
  Excellent (90-100): 1

Recent Low-Quality Code Examples:
  (none - everything looks good!)

Improvement Suggestions:
  💡 Great! Your AI coding setup is working well
  💡 Consider establishing code review processes for edge cases
```

**Alex:** "Perfect! Now I want to sync this data to my web dashboard so my team can see it."

```bash
# 10. Sync local logs to Supabase dashboard
$ toknxr sync

[Sync] Reading 1 interactions from interactions.log
[Sync] Analyzing interactions for quality insights
[Sync] Preparing to sync 1 interactions to Supabase
[Sync] Syncing interaction 1/1...
[Sync] Successfully synced to dashboard
[Sync] Data now available at https://your-toknxr-app.com/dashboard

Synced 1 interactions to your dashboard ✅
```

**Alex opens dashboard:** "Let me check the web interface."

### **Web Dashboard Results:**

- **Stats Cards:** Total cost $0.0005, 1 interaction, 0% waste, 0% hallucination rate
- **Charts:** Cost trends, quality scores over time
- **Recent Interactions:** Shows the fibonacci function request with quality score
- **Analysis:** "Great session! Low costs, high quality AI responses"

**Alex:** "Excellent! I have full visibility into my AI usage. Let me work more and then check if there are any budget concerns."

```bash
# Alex works through the day, proxy tracks everything automatically

# Later that afternoon...
$ toknxr stats

# Shows accumulated usage across the day
# Alerts if approaching budget limits
# Identifies patterns in AI effectiveness

$ toknxr providers

AI Provider Comparison

🏢 Gemini-Pro:
  Total Interactions: 47
  Hallucination Rate: 3.2%
  Avg Quality Score: 84/100
  Avg Effectiveness: 89/100

🏆 Performance Summary:
  Best Provider: Gemini-Pro (84/100 quality)
```

**Alex (end of day):** "Wow! I've automatically tracked 47 AI interactions, analyzed code quality, caught some hallucinations early, and stayed under budget. I'll sync this to the team dashboard."

---

## **🎭 The End Result:**

✅ **Automatic tracking** of ALL AI usage (tokens, costs, quality)
✅ **Real-time alerts** for budgets and hallucinations
✅ **Team visibility** through synced dashboard
✅ **Data-driven optimization** of AI workflows
✅ **Cost control** and quality insights

_The user became an **AI efficiency expert** without extra work - just normal development with automatic superpowers! 🦸‍♂️_

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

| Provider             | Endpoint                            | Status   |
| -------------------- | ----------------------------------- | -------- |
| **Ollama-Llama3**    | `http://localhost:8788/ollama`      | ✅ Ready |
| **Gemini-Pro**       | `http://localhost:8788/gemini`      | ✅ Ready |
| **Gemini-Free**      | `http://localhost:8788/gemini-free` | ✅ Ready |
| **OpenAI-GPT4**      | `http://localhost:8788/openai`      | ✅ Ready |
| **Anthropic-Claude** | `http://localhost:8788/anthropic`   | ✅ Ready |

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
    contents: [{ parts: [{ text: 'Your prompt here' }] }],
  }),
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

### Enhanced CLI Commands

```bash
# Interactive menu with branding and system status
toknxr menu               # Full interactive experience
toknxr                    # Same as menu (default command)

# Welcome and branding
toknxr welcome            # Complete onboarding experience
toknxr logo               # Display TokNXR and Golden Sheep AI logos

# System management
toknxr init               # Enhanced setup wizard
toknxr doctor             # Professional diagnostic interface
```

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
