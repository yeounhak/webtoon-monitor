import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS, resolveProjectId } from './client';

export const searchLogsTool = tool({
  name: 'search_logs',
  description: 'NELO에서 Lucene 쿼리로 로그를 검색합니다. 프로젝트명, 시간 범위, 쿼리를 지정하여 로그를 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
    query: z.string().describe('Lucene 쿼리 (예: logLevel:ERROR)'),
    limit: z.number().min(1).max(100).default(20).describe('반환 로그 수'),
    sortTimeOrder: z.enum(['asc', 'desc']).default('desc').describe('정렬 순서'),
    searchAfterToken: z.string().nullable().describe('페이지네이션 토큰 (이전 응답의 nextSearchAfterToken). 첫 검색시 null'),
  }),
  execute: async ({ projectName, query, limit, sortTimeOrder, searchAfterToken }) => {
    const projectId = resolveProjectId(projectName);

    const params: Record<string, unknown> = {
      'dataSource.projectIds': projectId,
      query,
      limit,
      sortTimeOrder,
    };
    if (searchAfterToken != null) {
      params.searchAfterToken = searchAfterToken;
    }

    const result = await neloFetch('GET', '/api/v2/search', params);

    // 로그 본문 truncate하여 LLM 컨텍스트 절약
    try {
      const parsed = JSON.parse(result);
      if (parsed.success && parsed.data?.logs) {
        parsed.data.logs = parsed.data.logs.map((log: Record<string, unknown>) => {
          const source = log.source as Record<string, unknown> | undefined;
          if (source && typeof source.body === 'string' && source.body.length > 500) {
            return {
              ...log,
              source: {
                ...source,
                body: source.body.slice(0, 500) + '...(truncated)',
              },
            };
          }
          return log;
        });
        return JSON.stringify(parsed);
      }
    } catch {
      // truncate 실패 시 원본 반환
    }

    return result;
  },
});
