import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS, resolveProjectId } from './client';

export const trafficTodayTool = tool({
  name: 'get_traffic_today',
  description: '프로젝트의 스키마(로그 필드 목록)를 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
  }),
  execute: async ({ projectName }) => {
    const projectId = resolveProjectId(projectName);
    return neloFetch('GET', `/api/v2/projects/${projectId}/schema`);
  },
});
