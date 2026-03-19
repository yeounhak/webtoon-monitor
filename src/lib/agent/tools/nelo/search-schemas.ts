import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch, NELO_PROJECTS, resolveProjectId } from './client';

export const searchSchemasTool = tool({
  name: 'get_search_schemas',
  description: 'NELO 프로젝트의 검색 가능한 필드 목록(스키마)을 조회합니다.',
  parameters: z.object({
    projectName: z.enum(NELO_PROJECTS).describe('NELO 프로젝트명'),
  }),
  execute: async ({ projectName }) => {
    const projectId = resolveProjectId(projectName);
    return neloFetch('GET', '/api/v2/search/schemas', {
      'dataSource.projectIds': projectId,
    });
  },
});
