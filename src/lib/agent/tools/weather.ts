import { tool } from '@openai/agents';
import { z } from 'zod';

export const weatherTool = tool({
  name: 'get_weather',
  description: '도시의 현재 날씨를 조회합니다. 온도, 날씨 상태, 습도, 풍속 정보를 반환합니다.',
  parameters: z.object({
    city: z.string().describe('날씨를 조회할 도시명 (예: Seoul, Tokyo, New York)'),
  }),
  execute: async ({ city }) => {
    const res = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
    );
    if (!res.ok) {
      return JSON.stringify({ error: `날씨 조회 실패: ${city}` });
    }
    const data = await res.json();
    const cur = data.current_condition?.[0];
    return JSON.stringify({
      city,
      temp_c: cur?.temp_C,
      condition: cur?.weatherDesc?.[0]?.value,
      humidity: cur?.humidity,
      wind_kph: cur?.windspeedKmph,
    });
  },
});
