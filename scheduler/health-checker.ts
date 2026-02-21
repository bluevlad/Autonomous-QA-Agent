/**
 * QA 자동 점검 스케줄러 - Health Check 모듈
 *
 * Node.js 내장 fetch + AbortController 사용 (추가 의존성 없음)
 */

import { schedulerConfig, projects } from './config.js';
import type {
  ProjectHealthConfig,
  HealthCheckEndpoint,
  EndpointCheckResult,
  HealthCheckResult,
  HealthCheckStrategy,
} from './types.js';

async function checkEndpoint(
  endpoint: HealthCheckEndpoint,
  timeoutMs: number,
): Promise<EndpointCheckResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();

  try {
    const response = await fetch(endpoint.url, {
      signal: controller.signal,
      headers: { Accept: 'application/json, text/html' },
    });

    const responseTimeMs = Date.now() - start;
    const healthy = isHealthy(response, endpoint.strategy);

    // json-health 전략: JSON 본문에서 status 필드 확인
    if (endpoint.strategy === 'json-health' && response.ok) {
      try {
        const body = await response.json();
        const status = body.status?.toLowerCase?.();
        if (status && status !== 'ok' && status !== 'up' && status !== 'healthy') {
          return {
            url: endpoint.url,
            label: endpoint.label,
            healthy: false,
            statusCode: response.status,
            responseTimeMs,
            error: `Health status: ${body.status}`,
          };
        }
      } catch {
        // JSON 파싱 실패 시 status code만으로 판단
      }
    }

    return {
      url: endpoint.url,
      label: endpoint.label,
      healthy,
      statusCode: response.status,
      responseTimeMs,
    };
  } catch (err) {
    return {
      url: endpoint.url,
      label: endpoint.label,
      healthy: false,
      responseTimeMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function isHealthy(response: Response, strategy: HealthCheckStrategy): boolean {
  switch (strategy) {
    case 'status-ok':
      return response.status >= 200 && response.status < 300;
    case 'json-health':
      return response.status >= 200 && response.status < 300;
    case 'page-load':
      return response.status >= 200 && response.status < 400;
    default:
      return response.ok;
  }
}

export async function checkProjectHealth(
  project: ProjectHealthConfig,
): Promise<HealthCheckResult> {
  const results = await Promise.all(
    project.endpoints.map((ep) =>
      checkEndpoint(ep, schedulerConfig.healthCheckTimeout),
    ),
  );

  return {
    projectName: project.name,
    healthy: results.every((r) => r.healthy),
    endpoints: results,
    checkedAt: new Date().toISOString(),
  };
}

export async function checkAllProjects(): Promise<HealthCheckResult[]> {
  return Promise.all(projects.map((p) => checkProjectHealth(p)));
}
