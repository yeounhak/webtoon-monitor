import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS } from './client';

export const searchLogsTool = tool({
  name: 'search_logs',
  description: 'NELO에서 Lucene 쿼리로 로그를 검색합니다. 프로젝트명, 시간 범위, 쿼리를 지정하여 로그를 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
    query: z.string().describe('Lucene 쿼리 (예: logLevel:ERROR)'),
    from: z.string().describe('시작 시간 (ISO 8601, 예: 2026-03-18T00:00:00Z)'),
    to: z.string().describe('종료 시간 (ISO 8601, 예: 2026-03-18T23:59:59Z)'),
    limit: z.number().min(1).max(100).default(20).describe('반환 로그 수'),
    searchAfterToken: z.string().optional().describe('페이지네이션 토큰 (이전 응답의 searchAfterToken)'),
  }),
  execute: async ({ projectName, query, from, to, limit, searchAfterToken }) => {
    const result = await neloFetch('GET', '/api/v2/search', {
      projectName,
      query,
      from,
      to,
      limit,
      ...(searchAfterToken ? { searchAfterToken } : {}),
    });

    // 로그 본문 truncate하여 LLM 컨텍스트 절약
    try {
      const parsed = JSON.parse(result);
      if (parsed.success && parsed.data?.logs) {
        parsed.data.logs = parsed.data.logs.map((log: Record<string, unknown>) => ({
          ...log,
          body: typeof log.body === 'string' && log.body.length > 500
            ? log.body.slice(0, 500) + '...(truncated)'
            : log.body,
        }));
        return JSON.stringify(parsed);
      }
    } catch {
      // truncate 실패 시 원본 반환
    }

    return result;
  },
});
