import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS } from './client';

export const logStatsTool = tool({
  name: 'get_log_stats',
  description: '프로젝트별 일별 로그 볼륨 통계를 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
    from: z.string().describe('시작 날짜 (ISO 8601, 예: 2026-03-17)'),
    to: z.string().describe('종료 날짜 (ISO 8601, 예: 2026-03-18)'),
  }),
  execute: async ({ projectName, from, to }) => {
    return neloFetch('GET', '/api/v2/logStat', { projectName, from, to });
  },
});
