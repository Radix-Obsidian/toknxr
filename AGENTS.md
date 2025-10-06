# Repository Guidelines

## Project Structure & Module Organization

TokNxr is organized as a dual-platform system with a Next.js web application and a standalone CLI tool:

- **`src/`** - Next.js web application (dashboard, auth, components)
- **`toknxr-cli/`** - Standalone CLI tool for local AI tracking
- **`functions/`** - Firebase Functions for backend logic
- **`dataconnect/`** - GraphQL schema and PostgreSQL database definitions
- **`config/`** - Firebase credentials (gitignored)
- **`public/`** - Static web assets

## Build, Test, and Development Commands

```bash
# Web application development
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Build for production
npm run emulators    # Start Firebase emulators

# CLI tool operations
npm run start --prefix toknxr-cli        # Start AI tracking proxy
npm run cli --prefix toknxr-cli -- stats # View token usage analytics
npm run setup --prefix toknxr-cli        # Initialize CLI configuration

# Deployment
npm run deploy:vercel    # Deploy web app to Vercel
npm run deploy:firebase  # Deploy to Firebase Hosting
```

## Coding Style & Naming Conventions

- **Indentation**: 2 spaces (TypeScript/JavaScript)
- **File naming**: kebab-case for pages (`cli-login/page.tsx`), PascalCase for components (`AuthModal.tsx`)
- **Function/variable naming**: camelCase with descriptive names
- **Linting**: ESLint with Next.js TypeScript configuration (`eslint.config.mjs`)
- **Type safety**: Strict TypeScript with `"strict": true`

## Testing Guidelines

- **Framework**: No formal testing framework configured
- **CLI testing**: Manual test scripts in `toknxr-cli/test-*.mjs` for proxy and analysis features
- **Development testing**: Use Firebase emulators for local testing
- **Code quality**: Built-in code analysis in CLI tool for AI-generated code

## Commit & Pull Request Guidelines

- **Commit format**: `type: description` (e.g., `feat: Add comprehensive React-based web dashboard to CLI`)
- **Types used**: `feat`, `fix`, `docs`, `refactor` based on git history
- **PR process**: Direct commits to main branch (single developer project)
- **Branch naming**: Uses main branch for development

---

# Repository Tour

## 🎯 What This Repository Does

TokNxr is a comprehensive AI effectiveness & code quality analysis system that tracks AI token usage AND measures the actual effectiveness and quality of AI-generated code. It goes beyond simple cost tracking to help developers understand "what you got for what you paid" in terms of software development outcomes.

**Key responsibilities:**
- Track token usage across multiple AI providers (OpenAI, Gemini, Anthropic, Ollama)
- Analyze code quality and effectiveness of AI-generated code
- Provide real-time cost monitoring and budget policies
- Detect hallucinations and business impact analysis
- Offer both web dashboard and local-first CLI tracking

---

## 🏗️ Architecture Overview

### System Context
```
[Developer] → [TokNxr CLI Proxy] → [AI Providers (OpenAI/Gemini/etc)]
     ↓              ↓
[Web Dashboard] ← [Firebase Backend] ← [Local Analytics]
     ↓              ↓
[Firestore] ← [Data Connect (PostgreSQL)]
```

### Key Components
- **Next.js Web App** - Dashboard for viewing analytics, user management, and project tracking
- **CLI Proxy Server** - Local-first tool that intercepts AI API calls for real-time tracking
- **Firebase Functions** - Serverless backend for authentication and data processing
- **Data Connect** - GraphQL interface to PostgreSQL for structured data storage
- **Code Analysis Engine** - Built-in quality scoring and effectiveness measurement

### Data Flow
1. Developer makes AI request through CLI proxy server
2. Proxy logs interaction data and forwards request to AI provider
3. Response is analyzed for code quality, effectiveness, and hallucinations
4. Analytics are stored locally and optionally synced to Firebase
5. Web dashboard displays aggregated insights and trends

---

## 📁 Project Structure [Partial Directory Tree]

```
my-first-mvp/
├── src/                           # Next.js web application
│   ├── app/                       # App Router pages
│   │   ├── dashboard/             # Analytics dashboard
│   │   ├── profile/               # User profile management
│   │   ├── cli-login/             # CLI authentication flow
│   │   └── tracker/               # Token usage tracking
│   ├── components/                # React components
│   │   └── auth/                  # Authentication components
│   ├── contexts/                  # React contexts (AuthContext)
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utilities and configurations
│   └── dataconnect-generated/     # Generated GraphQL client
├── toknxr-cli/                    # Standalone CLI tool
│   ├── src/                       # CLI source code
│   │   ├── cli.ts                 # Main CLI interface
│   │   ├── proxy.ts               # AI request proxy server
│   │   ├── code-analysis.ts       # Code quality analysis
│   │   ├── ai-analytics.ts        # Analytics and reporting
│   │   └── hallucination-detector.ts # AI hallucination detection
│   ├── toknxr.config.json         # AI provider configurations
│   └── interactions.log           # Local interaction storage
├── functions/                     # Firebase Functions
│   ├── src/                       # Function source code
│   └── lib/                       # Compiled JavaScript
├── dataconnect/                   # GraphQL schema and queries
│   ├── schema/                    # Database schema definitions
│   └── example/                   # Sample queries
└── config/                        # Firebase credentials (gitignored)
```

### Key Files to Know

| File | Purpose | When You'd Touch It |
|------|---------|---------------------|
| `src/app/layout.tsx` | Root layout with auth provider | Adding global providers/styles |
| `src/firebase.ts` | Firebase client configuration | Changing Firebase settings |
| `toknxr-cli/src/cli.ts` | Main CLI interface | Adding new CLI commands |
| `toknxr-cli/src/proxy.ts` | AI request proxy server | Modifying tracking logic |
| `toknxr-cli/toknxr.config.json` | AI provider configurations | Adding new AI providers |
| `functions/src/index.ts` | Firebase Functions entry point | Adding backend functions |
| `dataconnect/schema/schema.gql` | Database schema | Modifying data structure |
| `package.json` | Web app dependencies and scripts | Adding dependencies/scripts |
| `firebase.json` | Firebase project configuration | Changing deployment settings |

---

## 🔧 Technology Stack

### Core Technologies
- **Language:** TypeScript (5.x) - Type safety and modern JavaScript features
- **Frontend Framework:** Next.js 15 with App Router - React-based web framework with SSR
- **Backend:** Firebase Functions (Node.js 22) - Serverless backend functions
- **Database:** Firebase Data Connect (PostgreSQL) + Firestore - Hybrid data storage

### Key Libraries
- **React 19** - UI library with latest features
- **Tailwind CSS 4** - Utility-first CSS framework for styling
- **Firebase SDK 12.3** - Authentication, Firestore, Functions integration
- **Commander.js** - CLI framework for the toknxr-cli tool
- **Axios** - HTTP client for AI provider API calls
- **Chalk** - Terminal styling for CLI output

### Development Tools
- **ESLint** - Code linting with Next.js TypeScript configuration
- **Firebase Emulators** - Local development environment
- **Turbopack** - Fast bundler for Next.js development
- **TSX** - TypeScript execution for CLI development

---

## 🌐 External Dependencies

### Required Services
- **Firebase Project** - Authentication, Firestore, Functions, Data Connect hosting
- **AI Provider APIs** - OpenAI, Google Gemini, Anthropic Claude, or local Ollama
- **Vercel (Optional)** - Alternative deployment platform for web app

### Optional Integrations
- **Webhook URLs** - Budget alert notifications via policy configuration
- **Keytar** - Secure credential storage for CLI authentication

### Environment Variables

```bash
# Firebase Configuration (Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=          # Firebase API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=      # Firebase auth domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=       # Firebase project ID

# Firebase Admin (Functions)
FIREBASE_PROJECT_ID=                   # Project ID for admin SDK
FIREBASE_PRIVATE_KEY=                  # Service account private key
FIREBASE_CLIENT_EMAIL=                 # Service account email

# AI Provider APIs (CLI)
GEMINI_API_KEY=                        # Google Gemini API key
OPENAI_API_KEY=                        # OpenAI API key (optional)
ANTHROPIC_API_KEY=                     # Anthropic API key (optional)
```

---

## 🔄 Common Workflows

### AI Token Tracking Workflow
1. Start CLI proxy server: `npm run start --prefix toknxr-cli`
2. Configure AI provider in `toknxr-cli/toknxr.config.json`
3. Point application to proxy URL (e.g., `http://localhost:8787/gemini/...`)
4. Make AI requests through proxy for automatic tracking
5. View analytics: `npm run cli --prefix toknxr-cli -- stats`

**Code path:** `CLI Request` → `proxy.ts` → `AI Provider` → `code-analysis.ts` → `interactions.log`

### Code Quality Analysis Workflow
1. AI generates code through proxy (automatically detected)
2. Code analysis engine scores quality (0-100) and effectiveness (0-100)
3. Hallucination detector identifies potential issues
4. Results stored with interaction data
5. View detailed analysis: `npm run cli --prefix toknxr-cli -- code-analysis`

**Code path:** `AI Response` → `code-analysis.ts` → `hallucination-detector.ts` → `Analytics Storage`

### Web Dashboard Usage
1. Start development: `npm run dev` and `npm run emulators`
2. Authenticate via Firebase Auth
3. View aggregated analytics from CLI interactions
4. Manage projects and organizations
5. Set up alerts and budget policies

**Code path:** `Web UI` → `Firebase Functions` → `Data Connect/Firestore` → `Dashboard Display`

---

## 📈 Performance & Scale

### Performance Considerations
- **CLI Proxy**: Minimal latency overhead (~10-50ms) for AI request interception
- **Local Storage**: Interactions stored in local log files for fast access
- **Serverless**: Firebase Functions auto-scale based on demand
- **Caching**: Next.js static generation for dashboard pages

### Monitoring
- **Metrics**: Token usage, cost tracking, code quality scores, hallucination rates
- **Alerts**: Budget threshold notifications via webhook integration
- **Analytics**: Real-time CLI dashboard at `http://localhost:8787/dashboard`

---

## 🚨 Things to Be Careful About

### 🔒 Security Considerations
- **API Keys**: Store in environment variables, never commit to git
- **Firebase Credentials**: Admin SDK keys in `config/` directory are gitignored
- **CLI Authentication**: Uses Firebase custom tokens for secure web app integration
- **Proxy Server**: Only runs locally, doesn't expose credentials to external services

### 💰 Cost Management
- **Budget Policies**: Configure spending limits in `toknxr.policy.json`
- **Provider Costs**: Different AI providers have varying token costs
- **Firebase Usage**: Functions and Data Connect have usage-based pricing
- **Monitoring**: Real-time cost tracking prevents unexpected charges

### 🔧 Development Gotchas
- **Emulator Setup**: Firebase emulators must be running for local development
- **CLI Dependencies**: CLI tool requires separate `npm install` in `toknxr-cli/`
- **TypeScript Paths**: Uses `@/*` path mapping for clean imports
- **Environment Variables**: Different variables needed for web app vs CLI tool

*Updated at: 2025-01-27 UTC*