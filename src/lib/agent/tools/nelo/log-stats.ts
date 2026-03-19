import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS, resolveProjectId } from './client';

export const logStatsTool = tool({
  name: 'get_log_stats',
  description: '프로젝트의 상세 정보 (트래픽, 스키마, 속성 등)를 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
  }),
  execute: async ({ projectName }) => {
    const projectId = resolveProjectId(projectName);
    return neloFetch('GET', `/api/v2/projects/${projectId}`);
  },
});
