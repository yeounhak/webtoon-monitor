import { createHmac } from 'crypto';

export const NELO_PROJECTS = [
  'webtoon-localization_dev',
  'webtoon-localization_stage',
  'webtoon-localization_prod',
] as const;

export type NeloProjectName = (typeof NELO_PROJECTS)[number];

function getConfig() {
  const baseUrl = process.env.NELO_BASE_URL;
  const accessKey = process.env.NELO_ACCESS_KEY;
  const secretKey = process.env.NELO_SECRET_KEY;

  if (!baseUrl || !accessKey || !secretKey) {
    throw new Error('NELO 환경변수가 설정되지 않았습니다 (NELO_BASE_URL, NELO_ACCESS_KEY, NELO_SECRET_KEY)');
  }

  return { baseUrl, accessKey, secretKey };
}

function buildAuthHeaders(method: string, path: string, secretKey: string, accessKey: string): Record<string, string> {
  const timestamp = new Date().toISOString();
  const message = `${method}\n${path}\n${timestamp}`;
  const signature = createHmac('sha256', secretKey).update(message).digest('base64');

  return {
    'x-nelo-date': timestamp,
    Authorization: `nelo ${accessKey}:${signature}`,
  };
}

export async function neloFetch(
  method: 'GET' | 'POST',
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<string> {
  const { baseUrl, accessKey, secretKey } = getConfig();

  let url = `${baseUrl}${path}`;
  if (method === 'GET' && params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers = buildAuthHeaders(method, path, secretKey, accessKey);
  headers['Content-Type'] = 'application/json';

  try {
    const res = await fetch(url, { method, headers });

    if (!res.ok) {
      return JSON.stringify({
        success: false,
        httpMeta: { method, url, status: res.status },
        error: `NELO API 오류 (HTTP ${res.status})`,
      });
    }

    const data = await res.json();
    return JSON.stringify({
      success: true,
      httpMeta: { method, url, status: res.status },
      data,
    });
  } catch (err) {
    return JSON.stringify({
      success: false,
      httpMeta: { method, url, status: null },
      error: `네트워크 오류: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
}
