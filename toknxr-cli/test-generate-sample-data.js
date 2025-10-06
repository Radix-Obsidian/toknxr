// Quick script to generate sample coding interactions for testing the dashboard
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sampleInteractions = [
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    provider: 'Gemini-Pro',
    model: 'gemini-2.5-flash',
    promptTokens: 150,
    completionTokens: 200,
    totalTokens: 350,
    costUSD: 0.05,
    taskType: 'coding',
    userPrompt: 'Create a React component for a todo list',
    aiResponse: 'Here\'s a React todo component...',
    extractedCode: `function TodoList() {
  const [todos, setTodos] = useState([]);
  return (
    <div>
      <h1>My Todos</h1>
      {/* Todo implementation */}
    </div>
  );
}`,
    codeQualityScore: 85,
    codeQualityMetrics: {
      syntaxValid: true,
      estimatedReadability: 0.8,
      hasFunctions: true,
      hasClasses: false,
      linesOfCode: 12,
      potentialIssues: []
    },
    effectivenessScore: 88
  },
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    provider: 'OpenAI-GPT4',
    model: 'gpt-4',
    promptTokens: 80,
    completionTokens: 120,
    totalTokens: 200,
    costUSD: 0.02,
    taskType: 'coding',
    userPrompt: 'Write a Python function to calculate fibonacci',
    aiResponse: 'def fibonacci(n):...',
    extractedCode: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`,
    codeQualityScore: 92,
    codeQualityMetrics: {
      syntaxValid: true,
      estimatedReadability: 0.9,
      hasFunctions: true,
      hasClasses: false,
      linesOfCode: 4,
      potentialIssues: []
    },
    effectivenessScore: 95
  },
  {
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
    provider: 'Gemini-Pro',
    model: 'gemini-2.5-flash',
    promptTokens: 200,
    completionTokens: 300,
    totalTokens: 500,
    costUSD: 0.08,
    taskType: 'coding',
    userPrompt: 'Create a TypeScript API endpoint',
    aiResponse: 'Here\'s a TypeScript API endpoint...',
    extractedCode: `import express from 'express';

const app = express();

app.get('/api/users', async (req, res) => {
  // Implementation here
});

export default app;`,
    codeQualityScore: 78,
    codeQualityMetrics: {
      syntaxValid: true,
      estimatedReadability: 0.7,
      hasFunctions: true,
      hasClasses: false,
      linesOfCode: 8,
      potentialIssues: ['Missing error handling']
    },
    effectivenessScore: 82
  }
];

const logFilePath = path.resolve(process.cwd(), 'interactions.log');

// Read existing log file
let existingContent = '';
if (fs.existsSync(logFilePath)) {
  existingContent = fs.readFileSync(logFilePath, 'utf8');
}

// Combine existing and sample data
const allInteractions = existingContent.trim()
  ? existingContent.trim() + '\n' + sampleInteractions.map(i => JSON.stringify(i)).join('\n')
  : sampleInteractions.map(i => JSON.stringify(i)).join('\n');

// Write back to file
fs.writeFileSync(logFilePath, allInteractions + '\n');

console.log(`✅ Generated ${sampleInteractions.length} sample coding interactions`);
console.log(`📊 Total interactions in log: ${allInteractions.split('\n').filter(Boolean).length}`);
console.log(`🔗 Dashboard available at: http://localhost:8788/dashboard`);
