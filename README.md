# TokNxr

[![License](https://img.shields.io/github/license/Radix-Obsidian/toknxr)](https://github.com/Radix-Obsidian/toknxr/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%D320-brightgreen)](https://nodejs.org/)
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

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase/Firebase credentials
```

---

## CLI Tool (`toknxr-cli`)

The `toknxr-cli` is a powerful, local-first tool for tracking token usage from any AI provider. It acts as a proxy server, intercepting your AI API requests, logging the token usage, and then forwarding the request to the actual provider.

### Core Features

- **Provider-Agnostic:** Track usage for any AI service (OpenAI, Gemini, Anthropic, Ollama, etc.) via a simple JSON configuration.
- **Local-First:** All data is logged to a local `interactions.log` file. No cloud account needed.
- **Simple Stats:** A built-in `stats` command provides a clean summary of your token usage by provider.

### Getting Started with the CLI

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
