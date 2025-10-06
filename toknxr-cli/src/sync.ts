import fs from 'fs';
import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';
import { getToken } from './auth.js';
import { setAuthToken } from './config.js';
import chalk from 'chalk';

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

export async function syncInteractions(supabase: SupabaseClient, options: { clear?: boolean }) {
    console.log(chalk.blue('Syncing local analytics with the cloud dashboard...'));

    // Get the stored token
    const token = await getToken();
    if (!token) {
        console.error(chalk.red('No authentication token found. Please login first with `toknxr login`.'));
        process.exit(1);
    }

    // Set auth in Supabase
    setAuthToken(token);

    const logFilePath = path.resolve(process.cwd(), 'interactions.log');
    if (!fs.existsSync(logFilePath)) {
      console.log(chalk.yellow('No interactions.log file found. Nothing to sync.'));
      return;
    }

    const fileContent = fs.readFileSync(logFilePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
        console.log(chalk.yellow('Log file is empty. Nothing to sync.'));
        return;
    }

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

    if (options.clear) {
      fs.writeFileSync(logFilePath, '');
      console.log(chalk.gray('Local interactions.log has been cleared.'));
    }
}
