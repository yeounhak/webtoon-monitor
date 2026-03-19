import { tool } from '@openai/agents';
import { z } from 'zod';
import { neloFetch } from './client';

export const alertsTool = tool({
  name: 'get_alerts',
  description: 'NELO 알림 규칙 목록을 조회합니다.',
  parameters: z.object({
    limit: z.number().min(1).max(100).default(20).describe('반환 알림 수'),
    offset: z.number().min(0).default(0).describe('오프셋'),
  }),
  execute: async ({ limit, offset }) => {
    return neloFetch('GET', '/api/v2/alerts', { limit, offset });
  },
});
