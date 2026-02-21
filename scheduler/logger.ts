/**
 * QA 자동 점검 스케줄러 - JSON 로그 관리
 *
 * scheduler/logs/run-YYYYMMDD-HHmmss.json 형식으로 저장
 */

import fs from 'node:fs';
import path from 'node:path';
import { schedulerConfig } from './config.js';
import type { SchedulerRunResult } from './types.js';

function ensureLogDir(): string {
  const logDir = path.resolve(schedulerConfig.logDir);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
}

function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

export function saveRunLog(result: SchedulerRunResult): string {
  const logDir = ensureLogDir();
  const timestamp = formatTimestamp(new Date(result.startedAt));
  const filename = `run-${timestamp}.json`;
  const filepath = path.join(logDir, filename);

  fs.writeFileSync(filepath, JSON.stringify(result, null, 2), 'utf-8');
  return filepath;
}

export function getRecentLogs(count: number = 10): SchedulerRunResult[] {
  const logDir = ensureLogDir();
  const files = fs
    .readdirSync(logDir)
    .filter((f) => f.startsWith('run-') && f.endsWith('.json'))
    .sort()
    .reverse()
    .slice(0, count);

  return files.map((f) => {
    const content = fs.readFileSync(path.join(logDir, f), 'utf-8');
    return JSON.parse(content) as SchedulerRunResult;
  });
}

export function cleanOldLogs(): number {
  const logDir = ensureLogDir();
  const cutoff = Date.now() - schedulerConfig.logRetentionDays * 24 * 60 * 60 * 1000;
  let deleted = 0;

  const files = fs
    .readdirSync(logDir)
    .filter((f) => f.startsWith('run-') && f.endsWith('.json'));

  for (const file of files) {
    const filepath = path.join(logDir, file);
    const stat = fs.statSync(filepath);
    if (stat.mtimeMs < cutoff) {
      fs.unlinkSync(filepath);
      deleted++;
    }
  }

  return deleted;
}
