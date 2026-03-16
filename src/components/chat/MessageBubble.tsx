import type { Message } from '@/types/chat';
import { ToolCallIndicator } from './ToolCallIndicator';

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        }`}
      >
        {message.toolCalls?.map((tc) => (
          <ToolCallIndicator key={tc.id} toolCall={tc} />
        ))}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
          {message.isStreaming && (
            <span className="ml-0.5 inline-block h-4 w-1.5 animate-blink bg-current align-text-bottom" />
          )}
        </div>
      </div>
    </div>
  );
}
