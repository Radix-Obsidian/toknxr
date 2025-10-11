# TokNXR Feedback System Integration Demo

This demo shows how the feedback system is integrated throughout the TokNXR CLI.

## Commands to Test

### 1. View Help with Feedback Info
```bash
npm run cli -- --help
```
Notice the description now includes feedback information.

### 2. Welcome Screen with Feedback
```bash
npm run cli -- welcome
```
Shows feedback prompt at the bottom.

### 3. Menu with Feedback Option
```bash
npm run cli -- menu
```
Includes "Send Feedback" option in the System Management section.

### 4. All Feedback Commands
```bash
# View feedback help
npm run cli -- feedback --help

# Quick feedback (would open interactive form)
npm run cli -- feedback --quick

# Detailed feedback (would open comprehensive form)  
npm run cli -- feedback --detailed

# List existing feedback
npm run cli -- feedback --list

# View feedback statistics
npm run cli -- feedback --stats

# Submit pending feedback (simulated)
npm run cli -- feedback --submit
```

### 5. Stats Screen with Feedback Integration
```bash
npm run cli -- stats
```
The interactive navigation includes a feedback option (F key).

## Key Features Demonstrated

✅ **Feedback in Main Menu** - Integrated into system management section
✅ **Feedback Commands** - Full command suite with help
✅ **Contextual Integration** - Feedback prompts appear on major screens  
✅ **Local Storage** - All feedback stored in `toknxr-feedback.json`
✅ **Statistics Tracking** - Shows pending/submitted counts
✅ **Multiple Input Methods** - Quick vs detailed forms
✅ **User-Controlled Submission** - Nothing sent without permission

## Feedback Data Structure

The system stores feedback in a structured JSON format:

```json
{
  "version": "1.0",
  "feedback": [
    {
      "id": "fb_timestamp_random",
      "timestamp": "2025-01-27T...",
      "type": "bug|feature|improvement|question|other",
      "severity": "low|medium|high|critical", 
      "context": "menu|stats|analysis|etc",
      "title": "Brief description",
      "description": "Detailed explanation",
      "userInfo": {
        "version": "0.4.0",
        "os": "darwin",
        "nodeVersion": "v24.8.0"
      },
      "status": "pending|submitted|acknowledged"
    }
  ],
  "stats": {
    "totalSubmissions": 3,
    "lastSubmission": "2025-01-27T...",
    "mostCommonType": "bug"
  }
}
```

This provides a seamless way for users to provide feedback from any part of the CLI experience!