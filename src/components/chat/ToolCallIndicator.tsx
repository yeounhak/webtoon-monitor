import type { ToolCallInfo } from '@/types/chat';

const TOOL_LABELS: Record<string, string> = {
  get_weather: '날씨 조회',
  get_exchange_rate: '환율 조회',
};

export function ToolCallIndicator({ toolCall }: { toolCall: ToolCallInfo }) {
  const label = TOOL_LABELS[toolCall.toolName] ?? toolCall.toolName;

  return (
    <div className="my-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-800">
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
      {toolCall.output && (
        <pre className="mt-1.5 max-h-24 overflow-auto whitespace-pre-wrap break-all text-zinc-500 dark:text-zinc-400">
          {tryFormatJson(toolCall.output)}
        </pre>
      )}
    </div>
  );
}

function tryFormatJson(value: unknown): string {
  if (typeof value !== 'string') {
    if (typeof value === 'object' && value !== null && 'text' in value) {
      return tryFormatJson(String((value as { text: unknown }).text));
    }
    return JSON.stringify(value, null, 2);
  }
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
