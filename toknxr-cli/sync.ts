import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase, setAuthToken } from './src/config.js';
import { getToken } from './src/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InteractionLog {
  timestamp: string;
  provider: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens: number;
  costUSD: number;
  taskType?: string;
  userPrompt?: string;
  aiResponse?: string;
  extractedCode?: string;
  codeQualityScore?: number;
  effectivenessScore?: number;
  [key: string]: any;
}

async function syncInteractions() {
  // Get the stored token
  const token = await getToken();
  if (!token) {
    console.error('No authentication token found. Please login first.');
    process.exit(1);
  }

  // Set auth in Supabase
  setAuthToken(token);

  // Read the interactions log
  const logPath = path.join(__dirname, 'interactions.log');
  if (!fs.existsSync(logPath)) {
    console.log('No interactions log found.');
    return;
  }

  const logContent = fs.readFileSync(logPath, 'utf-8');
  const lines = logContent.trim().split('\n');

  const logs: InteractionLog[] = [];
  for (const line of lines) {
    try {
      const log = JSON.parse(line);
      logs.push(log);
    } catch (error) {
      console.warn(`Skipping invalid log entry: ${line}`);
    }
  }

  if (logs.length === 0) {
    console.log('No valid interactions to sync.');
    return;
  }

  // Map logs to interactions
  const interactions = [];
  for (const log of logs) {
    // Find ai_service_id by provider and model
    const { data: aiService, error: aiError } = await supabase
      .from('ai_services')
      .select('id')
      .eq('provider', log.provider)
      .eq('name', log.model)
      .single();

    if (aiError || !aiService) {
      console.warn(`AI service not found for provider: ${log.provider}, model: ${log.model}`);
      continue;
    }

    // Assume project_id - for now, use a default or query user's projects
    // TODO: Add project selection or default project
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    if (projError || !projects || projects.length === 0) {
      console.error('No projects found for user.');
      continue;
    }

    const projectId = projects[0].id;

    const interaction = {
      project_id: projectId,
      ai_service_id: aiService.id,
      tokens_used: log.totalTokens,
      cost_in_cents: Math.round(log.costUSD * 100),
      timestamp: new Date(log.timestamp).toISOString(),
      request_details: log.userPrompt || '',
      response_details: log.aiResponse || log.extractedCode || '',
    };

    interactions.push(interaction);
  }

  if (interactions.length === 0) {
    console.log('No interactions to insert.');
    return;
  }

  // Insert interactions
  const { error: insertError } = await supabase
    .from('interactions')
    .insert(interactions);

  if (insertError) {
    console.error('Error syncing interactions:', insertError);
  } else {
    console.log(`Successfully synced ${interactions.length} interactions.`);
  }
}

export { syncInteractions };