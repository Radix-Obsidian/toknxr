import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

export interface BudgetsPolicy {
  version?: string;
  monthlyUSD?: number; // global monthly cap
  perProviderMonthlyUSD?: Record<string, number>; // caps per provider name
  webhookUrl?: string; // optional webhook for alerts
}

export function loadPolicy(cwd: string = process.cwd()): BudgetsPolicy | null {
  const policyPath = path.resolve(cwd, 'toknxr.policy.json');
  if (!fs.existsSync(policyPath)) return null;
  try {
    const raw = fs.readFileSync(policyPath, 'utf8');
    return JSON.parse(raw) as BudgetsPolicy;
  } catch {
    return null;
  }
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function computeMonthlySpend(logFilePath: string, monthKey: string) {
  const sums = { total: 0, byProvider: {} as Record<string, number> };
  if (!fs.existsSync(logFilePath)) return sums;
  const lines = fs.readFileSync(logFilePath, 'utf8').trim().split('\n').filter(Boolean);
  for (const line of lines) {
    try {
      const j = JSON.parse(line);
      const ts = new Date(j.timestamp);
      const key = currentMonthKey(ts);
      if (key !== monthKey) continue;
      const cost = Number(j.costUSD || 0);
      sums.total += cost;
      sums.byProvider[j.provider] = (sums.byProvider[j.provider] || 0) + cost;
    } catch {}
  }
  return sums;
}

export async function sendBudgetAlert(webhookUrl: string, payload: any) {
  try {
    await axios.post(webhookUrl, payload, { timeout: 5000 });
  } catch {}
}

