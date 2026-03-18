import { tool } from '@openai/agents';
import { z } from 'zod';

export const exchangeRateTool = tool({
  name: 'get_exchange_rate',
  description: '통화 간 환율을 조회합니다. 기준 통화 대비 대상 통화의 환율과 변환 금액을 반환합니다.',
  parameters: z.object({
    from: z.string().describe('기준 통화 코드 (예: USD, KRW, EUR)'),
    to: z.string().describe('대상 통화 코드 (예: KRW, USD, JPY)'),
    amount: z.number().describe('변환할 금액').default(1),
  }),
  execute: async ({ from, to, amount }) => {
    const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(from.toUpperCase())}`;
    const method = 'GET';
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return JSON.stringify({
          success: false,
          httpMeta: { method, url, status: res.status },
          error: `환율 조회 실패: ${from} (HTTP ${res.status})`,
        });
      }
      const data = await res.json();
      const rate = data.rates?.[to.toUpperCase()];
      if (rate == null) {
        return JSON.stringify({
          success: false,
          httpMeta: { method, url, status: res.status },
          error: `지원하지 않는 통화: ${to}`,
        });
      }
      return JSON.stringify({
        success: true,
        httpMeta: { method, url, status: res.status },
        data: {
          from: from.toUpperCase(),
          to: to.toUpperCase(),
          rate,
          amount,
          converted: Math.round(amount * rate * 100) / 100,
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
