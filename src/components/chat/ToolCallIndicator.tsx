'use client';

import { useState } from 'react';
import type { ToolCallInfo } from '@/types/chat';
import { ToolDetailModal } from './ToolDetailModal';

const TOOL_LABELS: Record<string, string> = {
  search_logs: '로그 검색',
  get_log_stats: '로그 통계',
  get_alerts: '알림 조회',
  get_traffic_today: '트래픽 조회',
  get_search_schemas: '검색 필드 조회',
};

type ModalTarget = 'request' | 'response' | null;

export function ToolCallIndicator({ toolCall }: { toolCall: ToolCallInfo }) {
  const [modalTarget, setModalTarget] = useState<ModalTarget>(null);
  const label = TOOL_LABELS[toolCall.toolName] ?? toolCall.toolName;
  const isError = toolCall.status === 'error';

  const borderClass = isError
    ? 'border-red-300 dark:border-red-700'
    : 'border-zinc-200 dark:border-zinc-700';

  const formattedArgs = toolCall.arguments
    ? tryFormatJson(toolCall.arguments)
    : '';
  const displayOutput = toolCall.output
    ? extractDisplayOutput(toolCall.output)
    : '';

  return (
    <>
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
          <button
            type="button"
            onClick={() => setModalTarget('request')}
            className="mt-1.5 cursor-pointer select-none text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            ▸ 요청
          </button>
        )}
        {toolCall.output && (
          <button
            type="button"
            onClick={() => setModalTarget('response')}
            className={`mt-1.5 ml-3 cursor-pointer select-none ${isError ? 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
          >
            ▸ 응답
          </button>
        )}
      </div>

      {modalTarget === 'request' && (
        <ToolDetailModal
          title={`${label} — 요청`}
          content={formattedArgs}
          httpMeta={toolCall.httpMeta}
          onClose={() => setModalTarget(null)}
        />
      )}
      {modalTarget === 'response' && (
        <ToolDetailModal
          title={`${label} — 응답`}
          content={displayOutput}
          isError={isError}
          onClose={() => setModalTarget(null)}
        />
      )}
    </>
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
