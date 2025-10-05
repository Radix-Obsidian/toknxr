# TokNxr - AI Effectiveness & Code Quality Analysis System

A comprehensive serverless platform for tracking AI token usage AND measuring the actual effectiveness and quality of AI-generated code. TokNxr goes beyond simple cost tracking to help developers understand "what you got for what you paid" in terms of software development outcomes.

**🚀 Transformations:**
- **Before**: "How much did AI cost?" → Cost tracking only
- **Now**: "What quality code did I get for the cost?" → Effectiveness & ROI analysis

## 🏗️ Architecture

**Complete Serverless Stack:**
- **Frontend**: Next.js 15 (App Router) + Tailwind CSS
- **Backend**: Firebase Functions (Node.js 22)
- **Database**: Firestore + Firebase Data Connect (GraphQL)
- **Authentication**: Firebase Auth
- **Deployment**: Vercel (Frontend) + Firebase (Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- Firebase CLI
- Vercel CLI (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/Radix-Obsidian/toknxr.git
cd toknxr

# Install dependencies
npm install

# Install Firebase Functions dependencies
cd functions && npm install && cd ..

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

---

##  CLI Tool (`toknxr-cli`)

The `toknxr-cli` is a powerful, local-first tool for tracking token usage from any AI provider. It acts as a proxy server, intercepting your AI API requests, logging the token usage, and then forwarding the request to the actual provider.

### Core Features

-   **Provider-Agnostic:** Track usage for any AI service (OpenAI, Gemini, Anthropic, Ollama, etc.) via a simple JSON configuration.
-   **Local-First:** All data is logged to a local `interactions.log` file. No cloud account needed.
-   **Simple Stats:** A built-in `stats` command provides a clean summary of your token usage by provider.

### How it Works

1.  You configure your AI providers in `toknxr-cli/toknxr.config.json`.
2.  You start the `toknxr-cli` proxy server.
3.  You point your application's API requests to the local proxy server instead of the AI provider's URL.
4.  The proxy logs the token usage from the response and then passes the response back to your application.
5.  You can view your aggregated stats at any time.

### Getting Started with the CLI

**1. Configure Your Providers**

Edit the `toknxr-cli/toknxr.config.json` file. Add the providers you want to track. You can define the `routePrefix` the proxy will listen on, the `targetUrl` of the real API, and how to map the token data from the provider's response.

```json
{
  "providers": [
    {
      "name": "Ollama-Llama3",
      "routePrefix": "/ollama",
      "targetUrl": "http://localhost:11434/api/chat",
      "apiKeyEnvVar": null,
      "tokenMapping": {
        "prompt": "prompt_eval_count",
        "completion": "eval_count"
      }
    },
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

**2. Install Dependencies**

```bash
npm install --prefix toknxr-cli
```

**3. Run the Proxy Server**

```bash
npm run start --prefix toknxr-cli
```

### Usage

**1. Making Requests**

In your application, change the API endpoint to point to the local proxy. For example, to use the "Gemini-Pro" provider configured above:

-   **Original URL:** `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
-   **New Proxy URL:** `http://localhost:8787/gemini/v1beta/models/gemini-pro:generateContent`

Remember to set any required API keys as environment variables (e.g., `export GEMINI_API_KEY="..."`).

**2. Viewing Your Stats**

To see a summary of your token usage, run the `stats` command:

```bash
npm run cli --prefix toknxr-cli -- stats
```

### 🎯 AI Code Quality Analysis (NEW!)

TokNxr goes beyond token tracking to analyze the **actual effectiveness** of AI-generated code. When you send coding requests through the proxy, it automatically analyzes:

#### **What It Measures:**
- **Code Quality Score** (0-100): Syntax validity, readability, structure
- **Effectiveness Score** (0-100): How well AI understood and fulfilled your prompt
- **Prompt Clarity Match**: How well keywords from your request appeared in code
- **Code Completeness**: Whether the solution appears fully implemented
- **Syntax Validation**: Basic language-specific syntax checking
- **Readability Assessment**: Code formatting and structure evaluation

#### **New CLI Commands:**

**Enhanced Stats with Code Quality:**
```bash
npm run cli --prefix toknxr-cli -- stats
# Shows: token costs + code quality averages + effectiveness scores
```

**Deep Code Analysis Insights:**
```bash
npm run cli --prefix toknxr-cli -- code-analysis
# Detailed language distribution + quality ranges + recommendations
```

#### **Supported Languages:**
- **JavaScript & TypeScript**: Full syntax validation, camelCase naming, JSDoc support
- **Python**: Indentation checking, docstring detection, underscore conventions
- **Extensible**: Easy to add more languages (Go, Rust, etc.)

#### **Example Analysis Output:**

```bash
🎯 Effectiveness Scores (Prompt ↔ Result):
    Excellent (90-100): 3    # Perfect prompt understanding
    Good (75-89): 8          # Good, but some room for improvement
    Fair (60-74): 5          # Works, but could be better
    Poor (0-59): 1           # Prompt needs clarification

💡 Improvement Suggestions:
  • Your prompts work well for basic functions
  • Try more specific error handling requirements
  • Consider adding performance constraints in prompts
```

#### **Real-Time Analysis:**
- Every coding request is automatically analyzed
- Results stored with complete interaction logs
- Compare different AI models on the same prompts
- Track improvement over time

#### **Free Models Optimized:**
Works with all configured providers:
- **Ollama** (LOCAL): $0 cost analysis
- **Gemini Free Tier**: Limits up to cost ceilings
- **OpenAI**: Compare cost vs quality trade-offs

#### **Data-Driven Decisions:**
Finally answer questions like:
- "Does GPT-4 actually give better code than GPT-3.5?"
- "Are my prompts effective, or do I need to improve them?"
- "Which model gives the best code quality per dollar?"
- "Should I use local models vs cloud APIs?"

---

## 🤖 Core Features

### Development

```bash
# Start Next.js development server
npm run dev

# Start Firebase emulators (in another terminal)
npm run emulators
```

### Deployment

#### Option 1: Vercel (Recommended for Frontend)
```bash
# Deploy to Vercel
npm run deploy:vercel
```

#### Option 2: Firebase Hosting
```bash
# Deploy to Firebase
npm run deploy:firebase
```

## 🔧 Environment Variables

Create `.env.local` with:

```bash
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=toknxr-mvp
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@toknxr-mvp.iam.gserviceaccount.com

# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=toknxr-mvp.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=toknxr-mvp
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=toknxr-mvp.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=109773731445
NEXT_PUBLIC_FIREBASE_APP_ID=1:109773731445:web:c8b7abe07fb78054dd6a3c
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-SP0P97LJVV
```

## 📊 Database Schema

The system tracks AI token usage with the following entities:

- **Users**: Individual users with organization membership
- **Organizations**: Companies/teams managing AI projects
- **Projects**: AI projects within organizations
- **AIServices**: AI provider configurations (costs, APIs)
- **TokenUsage**: Detailed usage tracking with costs
- **Alerts**: Usage threshold monitoring

## 🔒 Security

- Admin SDK credentials are gitignored
- Environment variables for production secrets
- Firestore security rules configured
- HTTPS enforced with security headers

## 📱 Mobile-First Design

- Responsive design with Tailwind CSS
- Progressive Web App ready
- Optimized for mobile performance
- Touch-friendly interface

## 🚀 Serverless Benefits

- **Zero Infrastructure Management**: No servers to maintain
- **Auto-scaling**: Handles traffic spikes automatically
- **Pay-per-use**: Only pay for what you use
- **Global CDN**: Fast loading worldwide
- **Built-in Security**: Firebase handles authentication and security

## 📁 Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
│   └── dataconnect-generated/ # GraphQL client
├── functions/               # Firebase Functions
├── dataconnect/            # GraphQL schema and queries
├── config/                 # Firebase credentials (gitignored)
└── public/                 # Static assets
```

## 🛠️ Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run emulators    # Start Firebase emulators
npm run deploy:firebase  # Deploy to Firebase
npm run deploy:vercel    # Deploy to Vercel
```

## 📈 Performance

- **Cold Start**: < 2 seconds
- **Bundle Size**: Optimized with Next.js
- **Caching**: Aggressive caching for static assets
- **CDN**: Global content delivery

## 🔄 CI/CD Ready

The project is configured for:
- GitHub Actions
- Vercel automatic deployments
- Firebase CI/CD
- Environment-based deployments

## 📄 License

Private - All rights reserved
