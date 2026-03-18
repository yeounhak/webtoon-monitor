export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: ToolCallInfo[];
  isStreaming?: boolean;
  timestamp: number;
}

export interface ToolHttpMeta {
  method: string;
  url: string;
  status: number | null; // null = 네트워크 에러 (응답 없음)
}

export interface ToolCallInfo {
  id: string;
  toolName: string;
  arguments: string;
  output?: string;
  status: 'calling' | 'completed' | 'error';
  httpMeta?: ToolHttpMeta;
}

export interface Room {
  id: string;
  name: string;
  messages: Message[];
  createdAt: number;
}

export type StreamEvent =
  | { type: 'text_delta'; delta: string }
  | { type: 'tool_call_start'; toolName: string; toolCallId: string; arguments: string }
  | { type: 'tool_call_output'; toolCallId: string; output: string; isError: boolean; httpMeta?: ToolHttpMeta }
  | { type: 'done' }
  | { type: 'error'; message: string };
