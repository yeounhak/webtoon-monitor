export const NELO_PROJECTS = [
  'webtoon-localization_dev',
  'webtoon-localization_stage',
  'webtoon-localization_prod',
] as const;

export type NeloProjectName = (typeof NELO_PROJECTS)[number];

/** 프로젝트 이름 → 숫자 ID 매핑 (NELO_PROJECT_IDS 환경변수에서 로드) */
const PROJECT_ID_MAP: Partial<Record<NeloProjectName, number>> = {};

function ensureProjectIdMap() {
  if (Object.keys(PROJECT_ID_MAP).length > 0) return;
  const raw = process.env.NELO_PROJECT_IDS;
  if (!raw) {
    throw new Error(
      'NELO_PROJECT_IDS 환경변수가 설정되지 않았습니다. ' +
        '형식: "webtoon-localization_dev:11685,webtoon-localization_stage:456"',
    );
  }
  for (const entry of raw.split(',')) {
    const [name, id] = entry.trim().split(':');
    if (name && id) (PROJECT_ID_MAP as Record<string, number>)[name] = Number(id);
  }
}

export function resolveProjectId(projectName: NeloProjectName): number {
  ensureProjectIdMap();
  const id = PROJECT_ID_MAP[projectName];
  if (!id) {
    throw new Error(
      `프로젝트 "${projectName}"의 숫자 ID를 찾을 수 없습니다. NELO_PROJECT_IDS 환경변수를 확인하세요.`,
    );
  }
  return id;
}

function getConfig() {
  const baseUrl = process.env.NELO_BASE_URL;
  const accessKey = process.env.NELO_ACCESS_KEY;
  const secretKey = process.env.NELO_SECRET_KEY;

  if (!baseUrl || !accessKey || !secretKey) {
    throw new Error(
      'NELO 환경변수가 설정되지 않았습니다 (NELO_BASE_URL, NELO_ACCESS_KEY, NELO_SECRET_KEY)',
    );
  }

  return { baseUrl, accessKey, secretKey };
}

function buildBasicAuth(accessKey: string, secretKey: string): string {
  return 'Basic ' + Buffer.from(`${accessKey}:${secretKey}`).toString('base64');
}

export async function neloFetch(
  method: 'GET' | 'POST',
  path: string,
  params?: Record<string, unknown>,
): Promise<string> {
  const { baseUrl, accessKey, secretKey } = getConfig();

  let url = `${baseUrl}${path}`;
  let body: string | undefined;

  if (method === 'GET' && params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  } else if (method === 'POST' && params) {
    body = JSON.stringify(params);
  }

  const headers: Record<string, string> = {
    Authorization: buildBasicAuth(accessKey, secretKey),
    accept: 'application/json',
    'Content-Type': 'application/json',
  };

  try {
    const res = await fetch(url, { method, headers, body });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '(응답 본문 읽기 실패)');
      return JSON.stringify({
        success: false,
        httpMeta: { method, url, status: res.status },
        error: `NELO API 오류 (HTTP ${res.status})`,
        detail: errorBody,
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
