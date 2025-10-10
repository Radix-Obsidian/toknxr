import { describe, it, expect } from 'vitest';
import { spawn } from 'node:child_process';
import path from 'node:path';

const CLI = path.resolve(process.cwd(), 'toknxr-cli', 'lib', 'cli.js');

function runCli(args: string[], env: NodeJS.ProcessEnv = {}, timeoutMs = 8000): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise(resolve => {
    const child = spawn('node', [CLI, ...args], {
      env: {
        ...process.env,
        SUPABASE_URL: process.env.SUPABASE_URL || 'http://localhost',
        SUPABASE_KEY: process.env.SUPABASE_KEY || 'dummy',
        ...env,
      },
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
    }, timeoutMs);
    child.stdout.on('data', d => (stdout += String(d)));
    child.stderr.on('data', d => (stderr += String(d)));
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

describe('TokNXR CLI smoke tests', () => {
  it('--help renders', async () => {
    const res = await runCli(['--help']);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Usage: toknxr');
  });

  it('budget --view runs', async () => {
    const res = await runCli(['budget', '--view']);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('Budget Configuration');
  });

  it('audit:view --help renders', async () => {
    const res = await runCli(['audit:view', '--help']);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('--to <date>');
  });

  it('audit:export --help renders', async () => {
    const res = await runCli(['audit:export', '--help']);
    expect(res.code).toBe(0);
    expect(res.stdout).toContain('--to <date>');
  });
});