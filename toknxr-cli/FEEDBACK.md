# TokNXR Feedback System

The TokNXR CLI now includes a comprehensive feedback system to help users report bugs, suggest features, and provide general feedback to improve the tool.

## Quick Access

From any screen in TokNXR, you can:
- **Press `F`** - Quick feedback shortcut (when available)
- **Run `toknxr feedback`** - Open the feedback center
- **See feedback prompt** - Appears at the bottom of most screens

## Feedback Commands

### Quick Feedback
```bash
toknxr feedback --quick
# or
toknxr feedback -q
```
Fast, minimal form for quick thoughts and feedback.

### Detailed Feedback 
```bash
toknxr feedback --detailed
# or 
toknxr feedback -d
```
Comprehensive form for bug reports and detailed feature requests.

### View Feedback History
```bash
toknxr feedback --list
# or
toknxr feedback -l
```
See all your previous feedback submissions.

### Submit Pending Feedback
```bash
toknxr feedback --submit         # Submit all pending
toknxr feedback --submit fb_123  # Submit specific feedback by ID
```

### Feedback Statistics
```bash
toknxr feedback --stats
```
View your feedback activity statistics.

## Feedback Types

- 🐛 **Bug Report** - Something is broken or not working correctly
- 💡 **Feature Request** - New functionality you'd like to see
- ⚡ **Improvement** - Ways to make existing features better  
- ❓ **Question** - Help understanding how something works
- 💬 **Other** - General feedback and suggestions

## Severity Levels

For bugs and issues:
- 🔥 **Critical** - Completely blocks your workflow
- ⚠️ **High** - Major impact on productivity
- 📋 **Medium** - Noticeable but manageable
- 💭 **Low** - Minor annoyance

## Data Storage

- Feedback is stored locally in `toknxr-feedback.json`
- No data is sent automatically unless you choose to submit
- You control when and what feedback gets submitted
- Feedback includes helpful context like command, OS, and version

## Feedback Integration

The feedback system is integrated throughout TokNXR:

- **Menu System** - Feedback option in main menu
- **Analytics Screens** - Feedback prompts in stats, analysis views
- **Error Conditions** - Suggested feedback for issues
- **Help Screens** - Links to feedback for improvements

## Privacy

- All feedback is stored locally by default
- Submission to TokNXR team is optional and user-controlled
- System info (OS, version) is included to help with debugging
- No personal information is collected beyond what you provide

## Examples

### Quick Bug Report
```bash
toknxr feedback -q
# Enter: "Stats command shows wrong token count"
# Select: Bug Report
# Done in 30 seconds!
```

### Detailed Feature Request
```bash
toknxr feedback -d
# Type: Feature Request
# Title: "Add export to CSV format"
# Description: [Opens editor for detailed description]
# Saves locally with full context
```

### View Your Impact
```bash
toknxr feedback --stats
# Shows: 5 feedback entries, 3 submitted, 2 pending
```

This feedback system ensures that TokNXR evolves based on real user needs and experiences!