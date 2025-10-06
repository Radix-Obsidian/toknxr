# TokNxr

[![License](https://img.shields.io/github/license/yourusername/toknxr)](https://github.com/yourusername/toknxr/blob/main/LICENSE)
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
git clone https://github.com/yourusername/toknxr.git
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
- **Real-time Updates**: Live data sync with Firebase
- **Mobile-First**: Responsive design for all devices

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
# Edit .env.local with your Firebase credentials

# Start development servers
npm run dev          # Next.js app (http://localhost:3000)
npm run emulators    # Firebase emulators
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
│   └── dataconnect-generated/     # Generated GraphQL client
├── toknxr-cli/                    # Standalone CLI tool
│   ├── src/                       # CLI source code
│   ├── toknxr.config.json         # Provider configurations
│   └── interactions.log           # Local interaction storage
├── functions/                     # Firebase Functions
├── dataconnect/                   # GraphQL schema and queries
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
git clone https://github.com/yourusername/toknxr.git
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
- **Optional Cloud Sync**: Choose what data to sync to Firebase
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

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/toknxr/issues)
- **Discussions**: [Community discussions and Q&A](https://github.com/yourusername/toknxr/discussions)
- **Documentation**: [Full documentation and guides](https://github.com/yourusername/toknxr/wiki)

---

Built with ❤️ by the open source community