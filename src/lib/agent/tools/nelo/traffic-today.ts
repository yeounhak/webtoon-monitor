import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS } from './client';

export const trafficTodayTool = tool({
  name: 'get_traffic_today',
  description: '프로젝트의 오늘 트래픽 통계를 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
  }),
  execute: async ({ projectName }) => {
    return neloFetch('GET', `/api/v2/projects/${encodeURIComponent(projectName)}/statistics/traffic/today`);
  },
});
