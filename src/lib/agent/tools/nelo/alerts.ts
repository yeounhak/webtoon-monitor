import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS } from './client';

export const alertsTool = tool({
  name: 'get_alerts',
  description: 'NELO 프로젝트의 알림 상태를 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
  }),
  execute: async ({ projectName }) => {
    return neloFetch('GET', '/api/v2/alerts', { projectName });
  },
});
