/**
 * QA 자동 점검 스케줄러 - WBS 매핑 시스템
 *
 * YAML 기반 WBS(Work Breakdown Structure)를 파싱하여
 * 테스트 실패와 기능 요구사항 간 매핑을 수행합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import type { WbsConfig, WbsItem, FailureDetail } from './types.js';

/** 프로젝트명(소문자) → 디렉토리명 매핑 */
const projectDirMap: Record<string, string> = {
  hopenvision: 'hopenvision',
  allergyinsight: 'AllergyInsight',
  edufit: 'EduFit',
  newsletterplatform: 'NewsLetterPlatform',
  'unmong-main': 'unmong-main',
  standup: 'StandUp',
};

export function loadProjectWbs(projectName: string): WbsConfig | null {
  const dirName = projectDirMap[projectName];
  if (!dirName) return null;

  const wbsPath = path.resolve(`projects/${dirName}/wbs.yml`);
  if (!fs.existsSync(wbsPath)) return null;

  try {
    const content = fs.readFileSync(wbsPath, 'utf-8');
    return yaml.load(content) as WbsConfig;
  } catch (err) {
    console.error(`[WBS] ${projectName} wbs.yml 파싱 실패:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export function loadAllWbs(): Map<string, WbsConfig> {
  const result = new Map<string, WbsConfig>();
  for (const projectName of Object.keys(projectDirMap)) {
    const wbs = loadProjectWbs(projectName);
    if (wbs) result.set(projectName, wbs);
  }
  return result;
}

export function findRelatedWbsItems(
  wbs: WbsConfig,
  failureDetails: FailureDetail[],
): WbsItem[] {
  if (!failureDetails.length || !wbs.features.length) return [];

  const matched = new Set<string>();
  const result: WbsItem[] = [];

  for (const detail of failureDetails) {
    if (!detail.filePath) continue;
    // filePath 형식: "projects/hopenvision/e2e/api.spec.ts" 또는 "e2e/api.spec.ts"
    const normalizedPath = detail.filePath.replace(/\\/g, '/');

    for (const feature of wbs.features) {
      if (matched.has(feature.id)) continue;

      for (const testFile of feature.testFiles) {
        if (normalizedPath.endsWith(testFile) || normalizedPath.includes(testFile)) {
          matched.add(feature.id);
          result.push(feature);
          break;
        }
      }
    }
  }

  return result;
}
