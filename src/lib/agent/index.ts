import { Agent } from '@openai/agents';
import { agentTools } from './tools';

export const chatAgent = new Agent({
  name: 'ChatAssistant',
  instructions:
    '당신은 유용한 AI 어시스턴트입니다. 사용자의 질문에 친절하고 정확하게 답변합니다. 날씨와 환율 도구를 활용하여 실시간 정보를 제공할 수 있습니다. 한국어로 대답합니다.',
  model: 'gpt-4.1',
  tools: agentTools,
});
