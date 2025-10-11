# TokNXR - AI Effectiveness & Code Quality Analysis

[![License](https://img.shields.io/github/license/goldensheepai/toknxr)](https://github.com/goldensheepai/toknxr/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

```
     ╭─╮
    ╱   ╲
   ╱ ● ● ╲     Golden Sheep AI
  ╱   ∩   ╲    Intelligent Development Tools
 ╱  ╲___╱  ╲
╱___________╲
╲___________╱
 │ │     │ │
 ╰─╯     ╰─╯

████████╗ ██████╗ ██╗  ██╗███╗   ██╗██╗  ██╗██████╗ 
╚══██╔══╝██╔═══██╗██║ ██╔╝████╗  ██║╚██╗██╔╝██╔══██╗
   ██║   ██║   ██║█████╔╝ ██╔██╗ ██║ ╚███╔╝ ██████╔╝
   ██║   ██║   ██║██╔═██╗ ██║╚██╗██║ ██╔██╗ ██╔══██╗
   ██║   ╚██████╔╝██║  ██╗██║ ╚████║██╔╝ ██╗██║  ██║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝

           AI Effectiveness & Code Quality Analysis
```

🚀 **The Ultimate AI Development Analytics Platform**

TokNXR is a comprehensive AI effectiveness & code quality analysis system that tracks AI token usage AND measures the actual effectiveness and quality of AI-generated code. It goes beyond simple cost tracking to help developers understand "what you got for what you paid" in terms of software development outcomes.

## ✨ Why TokNXR?

- **🎯 Beyond Cost Tracking**: Measure code quality and effectiveness, not just token costs
- **🔧 Dual Interface**: Beautiful CLI + comprehensive web dashboard
- **📊 Real-time Analysis**: Automatic code quality scoring and hallucination detection
- **🏠 100% Local-First**: All data stored locally with optional cloud sync
- **⚡ One-Command Setup**: Works out of the box with zero configuration
- **🔓 Open Source**: MIT licensed and community-driven
- **🐑 Golden Sheep AI**: Professional branding and user experience

## 🚀 Quick Start

### Option 1: Enhanced CLI Experience (Recommended)

```bash
# Install globally
npm install -g @goldensheepai/toknxr-cli

# Launch the interactive menu
toknxr

# Or use specific commands
toknxr welcome    # Complete onboarding experience
toknxr init       # Set up configuration
toknxr start      # Launch AI tracking proxy
toknxr stats      # View comprehensive analytics
```

### Option 2: Local Development Setup

```bash
# Clone and setup
git clone https://github.com/goldensheepai/toknxr.git
cd ToknXR-CLI

# CLI setup
cd toknxr-cli && npm install
npm run cli       # Launch enhanced CLI

# Web dashboard setup
cd .. && npm install
npm run dev       # Start Next.js dashboard
supabase start    # Start local Supabase
```

## 🎭 Enhanced User Experience

### Beautiful CLI Interface

```bash
$ toknxr

████████╗ ██████╗ ██╗  ██╗███╗   ██╗██╡  ██╗██████╗ 
╚══██╔══╝██╔═══██╗██║ ██╔╝████╗  ██║╚██╗██╔╝██╔══██╗
   ██║   ██║   ██║█████╔╝ ██╔██╗ ██║ ╚███╔╝ ██████╔╝
   ██║   ██║   ██║██╔═██╗ ██║╚██╗██║ ██╔██╗ ██╔══██╗
   ██║   ╚██████╔╝██║  ██╗██║ ╚████║██╔╝ ██╗██║  ██║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═╝

           AI Effectiveness & Code Quality Analysis

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👋 Message from Golden Sheep AI:
Welcome to the most advanced AI development analytics platform!

TokNXR helps you track token usage, analyze code quality, and detect hallucinations
in your AI-generated code. Everything runs locally for maximum privacy and speed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 Welcome to the future of AI development analytics!

🔧 System Status:
  ✅ Proxy Server (8788)
  ✅ Configuration (toknxr.config.json)
  ✅ Analytics Data (interactions.log)

📊 Quick Stats:
  Total Spent: $1.31
  AI Requests: 14
  Avg Quality: 87/100

🚀 Core Operations
Essential tracking and monitoring features

? Select an operation:
❯ 🚀 Start AI Tracking - Launch proxy server for real-time monitoring
  📊 View Analytics Dashboard - Comprehensive token usage & cost analysis
  🔍 Code Quality Analysis - Deep dive into AI-generated code quality
  🧠 Hallucination Detection - AI output validation and accuracy analysis
  🔬 Enhanced CodeHalu Analysis - Advanced pattern-based hallucination detection
  📈 Provider Comparison - Compare AI provider performance and costs
  🔍 Browse Interactions - Explore your AI interaction history
  (Use arrow keys to reveal more choices)
```

### Professional Onboarding

The `toknxr init` command now provides a guided setup experience:

```bash
$ toknxr init

╔╦╗┌─┐┬┌─┌┐┌╦ ╦┬─┐
 ║ │ │├┴┐│││╚╦╝├┬┘
 ╩ └─┘┴ ┴┘└┘ ╩ ┴└─
AI Code Quality Tracker

🎯 TokNXR Initialization Wizard
Setting up your AI analytics environment...

✅ Created .env
✅ Created toknxr.config.json
✅ Created toknxr.policy.json

╔══════════════════════════════════════════════════════════════════════════════════╗
║ ✨ TokNXR Initialization Complete!                                              ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║ Your AI analytics environment is ready to use                                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝

🚀 Next Steps:
   1. Add your API keys to .env file
   2. Run toknxr start to launch the proxy server
   3. Point your AI tools to http://localhost:8788
   4. Use toknxr stats to view analytics
```

## 🎯 Core Features

### 📊 **Real-time AI Analytics**
- Token usage tracking across all providers
- Cost analysis and budget monitoring
- Quality scoring for AI-generated code (0-100)
- Hallucination detection and business impact analysis
- Weekly/monthly trend analysis

### 🔧 **Multi-Provider Support**
- **OpenAI** (GPT-3.5, GPT-4, etc.)
- **Google Gemini** (Pro, Free tier)
- **Anthropic Claude** (All models)
- **Ollama** (Local models)
- **Easy extensibility** for new providers

### 💻 **Enhanced Developer Experience**
- **Beautiful CLI** with ASCII art branding and professional styling
- **Interactive menus** with system status and quick stats
- **Real-time proxy server** for seamless integration
- **Professional error handling** with actionable recommendations
- **Smart diagnostics** with categorized health checks

### 🌐 **Web Dashboard**
- Next.js 15 + React 19 interface
- Supabase backend with real-time sync
- Comprehensive analytics visualizations
- Team collaboration features
- Project and organization management

## 📖 Enhanced CLI Commands

### Core Experience Commands
```bash
toknxr                # Interactive menu (default)
toknxr welcome        # Complete onboarding experience
toknxr logo           # Display branding
toknxr menu           # Enhanced interactive menu
```

### Essential Operations
```bash
toknxr init           # Professional setup wizard
toknxr start          # Enhanced proxy server startup
toknxr doctor         # Comprehensive system diagnostics
toknxr stats          # Rich analytics dashboard
```

### Analysis & Quality
```bash
toknxr code-analysis  # Detailed code quality insights
toknxr hallucinations # AI hallucination statistics  
toknxr providers      # Provider performance comparison
toknxr analyze <prompt> <response>  # Analyze specific interaction
```

### Data Management
```bash
toknxr browse         # Interactive data explorer
toknxr search --query "term"  # Search interactions
toknxr export         # Export analytics data
toknxr tail           # Follow live interactions
```

### System Management
```bash
toknxr budget --set 50  # Configure spending limits
toknxr audit:init     # Enterprise audit logging
toknxr policy:init    # Set up budget policies
```

## ⚙️ Configuration

### Provider Setup (`toknxr.config.json`)
```json
{
  "providers": [
    {
      "name": "gemini",
      "routePrefix": "/gemini/",
      "targetUrl": "https://generativelanguage.googleapis.com/",
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

### Budget Policies (`toknxr.policy.json`)
```json
{
  "version": "1",
  "monthlyUSD": 50,
  "perProviderMonthlyUSD": {
    "Gemini-Pro": 30,
    "OpenAI-GPT4": 20
  },
  "webhookUrl": "https://your-webhook-url.com/alerts"
}
```

### Environment Variables (`.env`)
```bash
# Required for most providers
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Supabase (for web dashboard)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🔄 How It Works

1. **Enhanced Setup**: Run `toknxr init` for guided configuration
2. **Start Tracking**: `toknxr start` launches the enhanced proxy with professional startup sequence
3. **Route AI Requests**: Point your apps to `http://localhost:8788/provider-name/`
4. **Automatic Analysis**: All requests are logged with quality analysis and hallucination detection
5. **Rich Analytics**: Use `toknxr stats` to see comprehensive insights and trends
6. **Continuous Optimization**: Use quality metrics to improve prompts and reduce costs

## 📈 Analytics Features

### CLI Analytics
- **Cost Tracking**: Per-provider spending with budget alerts
- **Quality Scoring**: 0-100 scores for AI-generated code with detailed breakdowns
- **Effectiveness Analysis**: How well AI responses match your prompts
- **Hallucination Detection**: Identify potential AI errors with business impact
- **Trend Analysis**: Weekly/monthly usage patterns with visual charts
- **Interactive Browsing**: Paginated exploration with search and filtering

### Web Dashboard
- **Real-time Sync**: Optional cloud sync for team visibility
- **Advanced Visualizations**: Charts, graphs, and trend analysis
- **Team Collaboration**: Shared analytics and insights
- **Project Management**: Organize by projects and organizations
- **Export Capabilities**: Multiple formats for external analysis

## 🏗️ Architecture

### System Overview
```
[Developer] → [TokNXR CLI Proxy] → [AI Providers (OpenAI/Gemini/etc)]
     ↓              ↓
[Enhanced CLI] ← [Local Analytics] ← [Real-time Analysis]
     ↓              ↓
[Web Dashboard] ← [Supabase Backend] ← [Optional Cloud Sync]
     ↓              
[Supabase (PostgreSQL)]
```

### Technology Stack
- **CLI**: TypeScript, Commander.js, Inquirer, Chalk
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Backend**: Supabase Edge Functions, Node.js 22
- **Database**: Supabase PostgreSQL with Row Level Security
- **Analytics**: Custom analysis engine with hallucination detection

## 📁 Project Structure

```
ToknXR-CLI/
├── src/                           # Next.js web application
│   ├── app/                       # App Router pages
│   ├── components/                # React components
│   └── lib/                       # Utilities and configurations
├── toknxr-cli/                    # Standalone CLI tool
│   ├── src/                       # CLI source code
│   │   ├── cli.ts                 # Enhanced main CLI interface
│   │   ├── branding.ts            # Professional branding elements
│   │   ├── proxy.ts               # AI request proxy server
│   │   └── code-analysis.ts       # Code quality analysis
│   └── package.json               # CLI dependencies
├── supabase/                      # Supabase configuration
│   ├── functions/                 # Edge functions
│   └── migrations/                # Database migrations
└── public/                        # Static assets
```

## 🛠️ Development

### CLI Development
```bash
cd toknxr-cli
npm install
npm run dev        # Development mode with watch
npm run build      # Build for production
npm run test       # Run tests
```

### Web Dashboard Development
```bash
npm install
npm run dev        # Next.js dev server
supabase start     # Local Supabase
npm run build      # Production build
```

## 📊 What's Tracked

For every AI request, TokNXR captures and analyzes:

- **Token Usage**: Prompt, completion, and total tokens with cost calculation
- **Provider Info**: Which AI model and provider was used
- **Code Quality**: Syntax validation, readability, structure analysis (0-100 score)
- **Effectiveness**: How well the AI understood your request (0-100 score)
- **Hallucinations**: Detection of potential AI fabrications with confidence levels
- **Business Impact**: Time waste estimates and quality degradation metrics
- **Performance**: Response times and error rates
- **Trends**: Usage patterns and cost optimization opportunities

## 🤝 Contributing

We welcome contributions! TokNXR is open source and community-driven.

### Areas for Contribution
- **New AI Providers**: Add support for more AI services
- **Enhanced Analytics**: Advanced visualizations and insights
- **CLI Improvements**: Better user experience and features
- **Dashboard Features**: Enhanced web interface capabilities
- **Documentation**: Improved guides and examples

### How to Contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🔒 Security & Privacy

- **Local-First**: All sensitive data stays on your machine by default
- **Optional Cloud Sync**: Choose what data to sync to Supabase
- **API Key Protection**: Secure environment variable storage
- **Open Source**: Full transparency in code and security practices
- **Audit Logging**: Enterprise-grade audit trail for compliance

## 📈 Roadmap

- [ ] **Enhanced Language Support**: Go, Rust, Java, C++
- [ ] **Advanced Analytics**: ML-powered insights and recommendations
- [ ] **Team Collaboration**: Enhanced shared analytics and team dashboards
- [ ] **Plugin System**: Extensible architecture for custom analyzers
- [ ] **CI/CD Integration**: GitHub Actions and GitLab CI support
- [ ] **Enterprise Features**: SSO, advanced audit logging, custom deployments

## 🐑 About Golden Sheep AI

Built by [Golden Sheep AI](https://github.com/goldensheepai) with ❤️ for the developer community. We believe in creating intelligent development tools that enhance productivity while maintaining privacy and transparency.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Start tracking your AI effectiveness today with zero setup required!**

Try the enhanced CLI experience: `npm install -g @goldensheepai/toknxr-cli && toknxr`
