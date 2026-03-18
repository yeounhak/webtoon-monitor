import type { ToolCallInfo } from '@/types/chat';

const TOOL_LABELS: Record<string, string> = {
  get_weather: '날씨 조회',
  get_exchange_rate: '환율 조회',
};

export function ToolCallIndicator({ toolCall }: { toolCall: ToolCallInfo }) {
  const label = TOOL_LABELS[toolCall.toolName] ?? toolCall.toolName;
  const isError = toolCall.status === 'error';

  const borderClass = isError
    ? 'border-red-300 dark:border-red-700'
    : 'border-zinc-200 dark:border-zinc-700';

  return (
    <div className={`my-2 rounded-lg border ${borderClass} bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800`}>
      <div className="flex items-center gap-2">
        {toolCall.status === 'calling' ? (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-600 dark:border-t-zinc-300" />
        ) : toolCall.status === 'completed' ? (
          <svg
            className="h-3.5 w-3.5 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        )}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          {label}
          {toolCall.status === 'calling' && ' 호출 중...'}
        </span>
      </div>
      {(toolCall.arguments || toolCall.httpMeta) && (
        <details className="mt-1.5">
          <summary className="cursor-pointer select-none text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            요청
          </summary>
          <div className="mt-1 space-y-1">
            {toolCall.httpMeta && (
              <p className="font-mono text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold">{toolCall.httpMeta.method}</span>{' '}
                {toolCall.httpMeta.url}
              </p>
            )}
            {toolCall.arguments && (
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all text-zinc-500 dark:text-zinc-400">
                {tryFormatJson(toolCall.arguments)}
              </pre>
            )}
          </div>
        </details>
      )}
      {toolCall.output && (
        <details className="mt-1.5">
          <summary className={`cursor-pointer select-none ${isError ? 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}>
            응답
          </summary>
          {isError ? (
            <div className="mt-1 rounded bg-red-50 px-2 py-1.5 dark:bg-red-950/30">
              <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all text-red-600 dark:text-red-400">
                {extractDisplayOutput(toolCall.output)}
              </pre>
            </div>
          ) : (
            <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all text-zinc-500 dark:text-zinc-400">
              {extractDisplayOutput(toolCall.output)}
            </pre>
          )}
        </details>
      )}
    </div>
  );
}

function tryFormatJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

/** envelope 형식이면 data 또는 error만 추출, 아니면 그대로 포맷 */
function extractDisplayOutput(value: string): string {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && 'success' in parsed) {
      const display = parsed.success ? parsed.data : parsed.error;
      return typeof display === 'string'
        ? display
        : JSON.stringify(display, null, 2);
    }
    return JSON.stringify(parsed, null, 2);
  } catch {
    return value;
  }
}
