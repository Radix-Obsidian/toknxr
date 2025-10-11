# 🚀 ToknXR Quick Reference Card

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
```

## 🎯 Essential Commands (Copy & Paste Ready)

### Enhanced Setup (One-time)
```bash
# Install globally
npm install -g @goldensheepai/toknxr-cli

# Launch welcome experience
toknxr welcome

# Initialize with guided setup
toknxr init

# Add API key to .env
echo "GEMINI_API_KEY=your_key_here" >> .env
```

### Daily Usage
```bash
# Enhanced interactive menu (easiest way)
toknxr

# Or use specific commands
toknxr start              # Enhanced proxy startup
toknxr stats              # Rich analytics dashboard
toknxr menu               # Interactive command center
```

### Full Report Commands
```bash
toknxr stats              # Enhanced overview dashboard
toknxr code-analysis      # Code quality deep dive
toknxr hallucinations     # AI reliability check
toknxr providers          # Provider comparison
toknxr browse             # Interactive data explorer
```

### System Management
```bash
toknxr doctor             # Professional diagnostics
toknxr init               # Guided setup wizard
toknxr budget --set 50    # Budget management
toknxr tail               # Watch live requests
toknxr logo               # Display branding
```

---

## 🎨 Enhanced CLI Features

### Beautiful Interface
- **Golden Sheep AI branding** with ASCII art logos
- **Professional color schemes** and consistent styling
- **Interactive menus** with system status and quick stats
- **Contextual greetings** and time-of-day messages
- **Smart diagnostics** with categorized health checks

### Welcome Experience
```bash
toknxr welcome            # Complete onboarding
toknxr logo               # Branding display
toknxr                    # Interactive menu (default)
```

### System Status
The enhanced CLI shows real-time status:
```
🔧 System Status:
  ✅ Proxy Server (8788)
  ✅ Configuration (toknxr.config.json)
  ✅ Analytics Data (interactions.log)

📊 Quick Stats:
  Total Spent: $1.31
  AI Requests: 14
  Avg Quality: 87/100
```

---

## 📊 Understanding Your Scores

| Score | Quality | Effectiveness | Hallucination Rate |
|-------|---------|---------------|-------------------|
| 90-100 | 🟢 Excellent | Perfect understanding | 0-5% (Excellent) |
| 75-89  | 🔵 Good | Minor issues | 5-10% (Good) |
| 60-74  | 🟡 Fair | Needs review | 10-20% (Considering) |
| 0-59   | 🔴 Poor | Major problems | 20%+ (Poor) |

---

## 🔧 Quick Fixes

### "No interactions logged"
1. Check proxy is running: `toknxr start`
2. Verify endpoint: `http://localhost:8788/provider/...`
3. Check API keys in `.env`
4. Run diagnostics: `toknxr doctor`

### "Low quality scores"
1. Be more specific in prompts
2. Try different AI providers
3. Break complex requests into parts
4. Use provider comparison: `toknxr providers`

### "High costs"
1. Switch to cheaper providers for simple tasks
2. Set budgets: `toknxr budget --set 50`
3. Review low-effectiveness prompts
4. Export analysis: `toknxr export`

---

## 🎯 5-Minute Full Report

```bash
# 1. Launch enhanced menu
toknxr

# 2. Or run comprehensive analysis
toknxr stats              # Overview
toknxr code-analysis      # Code quality
toknxr providers          # Provider comparison
toknxr export --output report-$(date +%Y%m%d).json
```

**Done!** You now have complete AI usage insights with professional presentation.

---

## 🔗 Endpoint Setup

Change your AI endpoints from:
```
https://generativelanguage.googleapis.com/...
https://api.openai.com/...
https://api.anthropic.com/...
```

To:
```
http://localhost:8788/gemini/...
http://localhost:8788/openai/...
http://localhost:8788/anthropic/...
```

---

## 💡 Pro Tips

- **Use `toknxr` without commands** for the enhanced interactive menu
- **Try `toknxr welcome`** for the complete onboarding experience
- **Run `toknxr doctor`** for professional system diagnostics
- **Check `toknxr logo`** to see the beautiful Golden Sheep AI branding
- **Use contextual navigation** - the CLI guides you to appropriate next actions

---

**🐑 Golden Sheep AI - Intelligent Development Tools**

**Need help?** Check the full guide: `TOKNXR_FOR_DUMMIES.md`