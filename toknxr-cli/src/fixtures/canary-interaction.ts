import fs from 'node:fs';
import path from 'node:path';

export function appendFixtureInteraction() {
  const logPath = path.resolve(process.cwd(), 'interactions.log');
  const entry = {
    timestamp: new Date().toISOString(),
    provider: 'fixture',
    model: 'fixture-model',
    promptTokens: 5,
    completionTokens: 10,
    totalTokens: 15,
    costUSD: 0,
    taskType: 'chat',
    userPrompt: 'Fixture entry used to validate tooling path',
    aiResponse: 'This is a fixture interaction entry.',
  };
  fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
}

