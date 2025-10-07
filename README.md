# TokNxr

[![License](https://img.shields.io/github/license/Radix-Obsidian/toknxr)](https://github.com/Radix-Obsidian/toknxr/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

TokNxr is an open-source AI effectiveness & code quality analysis system that tracks AI token usage AND measures the actual effectiveness and quality of AI-generated code. It goes beyond simple cost tracking to help developers understand "what you got for what you paid" in terms of software development outcomes.

## 🚀 Why TokNxr?

- **🎯 Beyond Cost Tracking**: Measure code quality and effectiveness, not just token costs
- **🔧 Provider-Agnostic**: Works with OpenAI, Gemini, Anthropic, Ollama, and more
- **📊 Real-time Analysis**: Automatic code quality scoring and hallucination detection
- **🏠 Local-First**: All data stored locally with optional cloud sync
- **🌐 Web Dashboard**: Beautiful analytics dashboard with Supabase backend
- **🔓 Open Source**: MIT licensed and community-driven

## 📦 Installation

### Quick Start

#### Option 1: Clone and Run
```bash
# Clone the repository
git clone https://github.com/Radix-Obsidian/toknxr.git
cd toknxr

# Install dependencies
npm install

# Install CLI dependencies
npm install --prefix toknxr-cli

# Start the CLI proxy
npm run start --prefix toknxr-cli
```

#### Option 2: Web Dashboard
```bash
# Start development environment
npm run dev          # Next.js web app
supabase start       # Supabase local development (in another terminal)
```

### System Requirements

- Node.js version 20 or higher
- macOS, Linux, or Windows
- Supabase CLI (for database management)

## 🎯 Key Features

### AI Token Tracking & Analysis

- **Multi-Provider Support**: Track usage across OpenAI, Gemini, Anthropic, Ollama
- **Real-time Monitoring**: Proxy server intercepts and logs all AI requests
- **Cost Analysis**: Detailed cost breakdowns and budget tracking
- **Usage Analytics**: Comprehensive stats and trends

### Code Quality Analysis (NEW!)

- **Quality Scoring** (0-100): Syntax validity, readability, structure
- **Effectiveness Scoring** (0-100): How well AI understood your prompt
- **Language Support**: JavaScript, TypeScript, Python with extensible framework
- **Hallucination Detection**: Identify potential AI-generated issues

### Web Dashboard

- **Beautiful Analytics**: Modern React dashboard with Tailwind CSS
- **Team Management**: Organizations and project tracking
- **Real-time Updates**: Live data sync with Supabase
- **Mobile-First**: Responsive design for all devices


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

## 🔧 Getting Started

### 1. Configure AI Providers

Edit `toknxr-cli/toknxr.config.json` to add your AI providers:

```json
{
  "providers": [
    {
      "name": "Gemini-Pro",
      "routePrefix": "/gemini",
      "targetUrl": "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
      "apiKeyEnvVar": "GEMINI_API_KEY",
      "authHeader": "x-goog-api-key",
      "tokenMapping": {
        "prompt": "usageMetadata.promptTokenCount",
        "completion": "usageMetadata.candidatesTokenCount",
        "total": "usageMetadata.totalTokenCount"
      }
    },
    {
      "name": "Ollama-Llama3",
      "routePrefix": "/ollama",
      "targetUrl": "http://localhost:11434/api/chat",
      "apiKeyEnvVar": null,
      "tokenMapping": {
        "prompt": "prompt_eval_count",
        "completion": "eval_count"
      }
    }
  ]
}
```

### 2. Start the Proxy Server

```bash
# Set your API keys
export GEMINI_API_KEY="your_api_key_here"

# Start the proxy
npm run start --prefix toknxr-cli
```

### 3. Update Your Application

Point your AI requests to the local proxy:

```javascript
// Before
const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
  // your request
});

// After
const response = await fetch('http://localhost:8787/gemini/v1beta/models/gemini-pro:generateContent', {
  // same request - proxy handles the rest
});
```

### 4. View Analytics

```bash
# Basic stats
npm run cli --prefix toknxr-cli -- stats

# Detailed code analysis
npm run cli --prefix toknxr-cli -- code-analysis
```

## 📊 CLI Commands

### Token Usage Analytics
```bash
# View comprehensive usage stats
npm run cli --prefix toknxr-cli -- stats

# Example output:
# 📊 Token Usage Summary (Last 30 days)
# ├─ Gemini-Pro: 45,230 tokens ($2.26)
# ├─ Ollama-Llama3: 12,450 tokens ($0.00)
# └─ Total: 57,680 tokens ($2.26)
```

### Code Quality Analysis
```bash
# Deep code quality insights
npm run cli --prefix toknxr-cli -- code-analysis

# Example output:
# 🎯 Code Quality Analysis
# ├─ Average Quality Score: 87/100
# ├─ Average Effectiveness: 92/100
# ├─ Languages: JavaScript (60%), Python (40%)
# └─ Recommendations: 3 suggestions available
```

### Real-time Dashboard
```bash
# Access web dashboard at http://localhost:8787/dashboard
npm run start --prefix toknxr-cli
```

## 🌐 Web Dashboard

### Development Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development servers
npm run dev          # Next.js app (http://localhost:3000)
supabase start       # Supabase local development
```

### Environment Variables

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Supabase Service Role (for server-side)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Deployment

#### Option 1: Vercel (Recommended)
```bash
npm run deploy:vercel
```

#### Option 2: Supabase Hosting
```bash
supabase functions deploy
```

## 🏗️ Architecture

### System Overview

```
[Developer] → [TokNxr CLI Proxy] → [AI Providers]
     ↓              ↓
[Web Dashboard] ← [Supabase Backend] ← [Local Analytics]
     ↓              ↓
[PostgreSQL] ← [Supabase Auth & RLS]
```

### Technology Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Supabase Edge Functions, Node.js 22
- **Database**: Supabase PostgreSQL with Row Level Security
- **CLI**: TypeScript, Commander.js, Axios
- **Authentication**: Supabase Auth

## 📁 Project Structure

```
toknxr/
├── src/                           # Next.js web application
│   ├── app/                       # App Router pages
│   ├── components/                # React components
│   ├── lib/                       # Utilities and configurations
│   └── supabase.ts                # Supabase client configuration
├── toknxr-cli/                    # Standalone CLI tool
│   ├── src/                       # CLI source code
│   ├── toknxr.config.json         # Provider configurations
│   └── interactions.log           # Local interaction storage
├── supabase/                      # Supabase configuration
│   ├── config.toml                # Supabase project config
│   ├── migrations/                # Database migrations
│   └── functions/                 # Edge functions
└── public/                        # Static assets
```

## 🤝 Contributing

We welcome contributions! TokNxr is open source and community-driven.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests if applicable
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/Radix-Obsidian/toknxr.git
cd toknxr

# Install dependencies
npm install
npm install --prefix toknxr-cli

# Start development
npm run dev          # Web app
npm run start --prefix toknxr-cli  # CLI proxy
```

### Areas for Contribution

- **New AI Providers**: Add support for more AI services
- **Language Support**: Extend code analysis to more programming languages
- **Dashboard Features**: Enhance the web interface
- **Documentation**: Improve guides and examples
- **Testing**: Add comprehensive test coverage

## 📚 Documentation

### Getting Started
- **[Quick Start Guide](#getting-started)** - Get up and running quickly
- **[Configuration Guide](#configure-ai-providers)** - Set up AI providers
- **[CLI Commands](#cli-commands)** - Command reference

### Advanced Topics
- **[Web Dashboard Setup](#web-dashboard)** - Deploy the analytics dashboard
- **[Architecture Overview](#architecture)** - System design and components
- **[Contributing Guide](#contributing)** - How to contribute to the project

## 🔒 Security

- **Local-First**: All sensitive data stays on your machine by default
- **Optional Cloud Sync**: Choose what data to sync to Supabase
- **API Key Protection**: Environment variables and secure storage
- **Open Source**: Full transparency in code and security practices

## 📈 Roadmap

- [ ] **Enhanced Language Support**: Go, Rust, Java, C++
- [ ] **Advanced Analytics**: ML-powered insights and recommendations
- [ ] **Team Collaboration**: Shared analytics and team dashboards
- [ ] **Plugin System**: Extensible architecture for custom analyzers
- [ ] **CI/CD Integration**: GitHub Actions and GitLab CI support
- [ ] **Enterprise Features**: SSO, audit logs, advanced security

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase Team** - For the excellent PostgreSQL platform
- **Next.js Team** - For the amazing React framework
- **AI Provider Teams** - OpenAI, Google, Anthropic for their APIs
- **Open Source Community** - For inspiration and contributions

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Radix-Obsidian/toknxr/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/Radix-Obsidian/toknxr/discussions)
- **Documentation**: [Full documentation and guides](https://github.com/Radix-Obsidian/toknxr/wiki)

---

Built with ❤️ by the open source community
