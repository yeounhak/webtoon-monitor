import { tool } from '@openai/agents';
import { z } from 'zod';

export const weatherTool = tool({
  name: 'get_weather',
  description: '도시의 현재 날씨를 조회합니다. 온도, 날씨 상태, 습도, 풍속 정보를 반환합니다.',
  parameters: z.object({
    city: z.string().describe('날씨를 조회할 도시명 (예: Seoul, Tokyo, New York)'),
  }),
  execute: async ({ city }) => {
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const method = 'GET';
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return JSON.stringify({
          success: false,
          httpMeta: { method, url, status: res.status },
          error: `날씨 조회 실패: ${city} (HTTP ${res.status})`,
        });
      }
      const json = await res.json();
      const cur = json.data?.current_condition?.[0];
      return JSON.stringify({
        success: true,
        httpMeta: { method, url, status: res.status },
        data: {
          city,
          temp_c: cur?.temp_C,
          condition: cur?.weatherDesc?.[0]?.value,
          humidity: cur?.humidity,
          wind_kph: cur?.windspeedKmph,
        },
      });
    } catch (err) {
      return JSON.stringify({
        success: false,
        httpMeta: { method, url, status: null },
        error: `네트워크 오류: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  },
});
