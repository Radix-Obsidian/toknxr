# TokNXR CLI

[![License](https://img.shields.io/github/license/Radix-Obsidian/toknxr)](https://github.com/Radix-Obsidian/toknxr/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

🚀 **CLI-Powered AI Analytics - No Cloud Required!**

TokNXR is a local-first AI effectiveness & code quality analysis tool. Track AI token usage, measure code quality, detect hallucinations, and optimize your AI workflows - all from your terminal with zero cloud dependencies.

## ✨ Why TokNXR CLI?

- **🎯 Beyond Cost Tracking**: Measure code quality and effectiveness, not just token costs
- **🔧 Provider-Agnostic**: Works with OpenAI, Gemini, Anthropic, Ollama, and more
- **📊 Real-time Analysis**: Automatic code quality scoring and hallucination detection
- **🏠 100% Local**: All data stored locally with zero cloud dependencies
- **⚡ Instant Start**: Zero configuration - works out of the box
- **🔓 Open Source**: MIT licensed and community-driven

## 🚀 Quick Start

### Global Installation

```bash
npm install -g @goldensheepai/toknxr-cli

# Set up your environment
toknxr init

# Add your API key to .env
echo "GEMINI_API_KEY=your_key_here" >> .env

# Start tracking
toknxr start

# View analytics  
toknxr stats
```

### Local Development

```bash
# Clone and install
git clone https://github.com/Radix-Obsidian/toknxr.git
cd toknxr
cd toknxr-cli && npm install

# Start the CLI
npm run start
```

### 🎭 A Day with TokNXR: Before and After

**Before TokNXR:**

You're using AI to code, but you're flying blind.
- **Is this AI-generated code any good?** You have to manually review everything.
- **How much is this costing me?** You get a surprise bill at the end of the month.
- **Is there a better AI model for this task?** You're just guessing.

**After TokNXR:**

You run `toknxr start` once in the morning. You code as usual. At the end of the day, you run `toknxr stats`.

```
📊 TokNXR Analytics Overview
------------------------------------
Total Cost: $2.75
Total Requests: 82
Estimated Waste: 15%
Hallucination Rate: 5%

🤖 Provider Performance
----------------------------------------------------------------
Provider      | Tokens   | Cost    | Quality | Effectiveness
----------------------------------------------------------------
Gemini-Pro    | 45,230   | $2.26   | 87/100  | 92/100
OpenAI-GPT4   | 12,450   | $0.49   | 75/100  | 85/100

💡 Improvement Recommendations:
- Your prompts for OpenAI-GPT4 are 15% less effective than for Gemini-Pro.
- You could have saved $0.41 by using Gemini-Pro for all tasks.
```

**The Value:** In 5 minutes, you've gained complete visibility into your AI usage. You know exactly what you're spending, which AI models are performing best, and how to improve your prompts to save money and get better results.

## 🎯 Core Features

### 📊 **Real-time AI Analytics**
- Token usage tracking across all providers
- Cost analysis and budget monitoring
- Quality scoring for AI-generated code
- Hallucination detection and business impact analysis

### 🔧 **Provider Support**
- OpenAI (GPT-3.5, GPT-4, etc.)
- Google Gemini Pro
- Anthropic Claude
- Ollama (local models)
- Easy to add new providers

### 💻 **Developer Experience**
- Interactive terminal UI with rich visualizations
- Real-time proxy server for seamless integration
- File-based analytics with powerful CLI tools
- Comprehensive code quality metrics

## 📖 Commands

### Essential Commands
```bash
toknxr start          # Launch proxy server
toknxr stats          # View usage analytics
toknxr init           # Initialize configuration
toknxr menu           # Interactive command menu
toknxr doctor         # Validate setup
```

### Analysis Commands
```bash
toknxr code-analysis  # Detailed code quality insights
toknxr hallucinations # AI hallucination statistics  
toknxr analyze <prompt> <response>  # Analyze specific interaction
toknxr tail           # Follow live interactions
```

### Management Commands
```bash
toknxr policy:init    # Set up budget policies
toknxr browse         # Interactive data explorer
toknxr export         # Export analytics data
```

## ⚙️ Configuration

TokNXR uses simple JSON configuration files:

### `toknxr.config.json` (Provider Setup)
```json
{
  "providers": [
    {
      "name": "gemini",
      "routePrefix": "/gemini/",
      "targetUrl": "https://generativelanguage.googleapis.com/",
      "apiKeyEnvVar": "GEMINI_API_KEY",
      "authHeader": "x-goog-api-key"
    }
  ]
}
```

### `toknxr.policy.json` (Budget Policies)
```json
{
  "version": "1",
  "monthlyUSD": 50,
  "perProviderMonthlyUSD": {
    "Gemini-Pro": 30
  },
  "webhookUrl": ""
}
```

## 🔄 How It Works

1. **Start the Proxy**: `toknxr start` launches a local proxy server
2. **Route AI Requests**: Point your apps to `http://localhost:8788/provider-name/`
3. **Automatic Tracking**: All requests are logged with quality analysis
4. **View Analytics**: Use `toknxr stats` to see insights and trends
5. **Optimize**: Use quality metrics to improve prompts and reduce costs

## 📈 Analytics Features

- **Cost Tracking**: Per-provider spending with budget alerts
- **Quality Scoring**: 0-100 scores for AI-generated code
- **Effectiveness Analysis**: How well AI responses match your prompts
- **Hallucination Detection**: Identify potential AI errors
- **Trend Analysis**: Weekly/monthly usage patterns
- **Interactive Browsing**: Paginated exploration of all interactions

## 🛠️ Development

```bash
# Install dependencies
cd toknxr-cli && npm install

# Development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🐑 About

Built by [Golden Sheep AI](https://github.com/Radix-Obsidian) with ❤️ for the developer community.

---

**Start tracking your AI effectiveness today with zero setup required!**

**1. Configure Your Providers**

Edit the `toknxr-cli/toknxr.config.json` file to add the providers you want to track.

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
    }
  ]
}
```

**2. Start the Proxy Server**

```bash
# Set your API keys
export GEMINI_API_KEY="your_api_key_here"

# Start the proxy
npm run start --prefix toknxr-cli
```

**3. Update Your Application**

Point your AI requests to the local proxy (e.g., `http://localhost:8787/gemini/...`).

**4. View Analytics**

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
├── toknxr-cli/                    # Standalone CLI tool
├── supabase/                      # Supabase configuration
└── public/                        # Static assets
```

## 🤝 Contributing

We welcome contributions! TokNxr is open source and community-driven.

### How to Contribute

1.  **Fork the repository**
2.  **Create a feature branch**: `git checkout -b feature/amazing-feature`
3.  **Commit your changes**: `git commit -m 'Add amazing feature'`
4.  **Push to the branch**: `git push origin feature/amazing-feature`
5.  **Open a Pull Request**

### Areas for Contribution

- **New AI Providers**: Add support for more AI services
- **Language Support**: Extend code analysis to more programming languages
- **Dashboard Features**: Enhance the web interface
- **Documentation**: Improve guides and examples

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

## 📄 License

Private - All rights reserved
