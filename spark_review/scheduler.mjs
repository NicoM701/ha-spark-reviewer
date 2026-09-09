import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export function readOptions(value) {
  if (!value || typeof value.enabled !== 'boolean' || typeof value.publish !== 'boolean' || !Number.isInteger(value.interval_minutes) || value.interval_minutes < 10 || value.interval_minutes > 1440) throw new Error('Invalid app options');
  return value;
}

async function main() {
  process.umask(0o077);
  fs.mkdirSync(process.env.SPARK_DATA_DIR, { recursive: true, mode: 0o700 });
  let child;
  const abort = new AbortController();
  const stop = () => { abort.abort(); child?.kill('SIGTERM'); };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
  while (!abort.signal.aborted) {
    const options = readOptions(JSON.parse(fs.readFileSync('/data/options.json', 'utf8')));
    if (options.enabled) {
      // Await completion before the next interval: reviews never overlap.
      await new Promise(resolve => {
        child = spawn(process.execPath, ['/app/reviewer.mjs', ...(options.publish ? ['--publish'] : [])], { stdio: ['ignore', 'inherit', 'inherit'], env: process.env });
        child.once('error', () => { console.error('Reviewer could not start'); resolve(); });
        child.once('close', () => { child = undefined; resolve(); });
      });
    } else console.log('Reviewer disabled; waiting for configuration and authentication.');
    try { await delay(options.interval_minutes * 60000, undefined, { signal: abort.signal }); } catch { break; }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(() => { console.error('Scheduler configuration failed'); process.exitCode = 1; });
