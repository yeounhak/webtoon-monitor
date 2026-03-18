'use client';

import { useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { useChatState, useChatDispatch } from '@/contexts/ChatContext';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export function ChatArea() {
  const state = useChatState();
  const dispatch = useChatDispatch();
  const { activeRoom, isStreaming, sendMessage } = useChat();

  const handleWelcomeSend = useCallback(
    (content: string) => {
      const id = crypto.randomUUID();
      const roomNumber = state.rooms.length + 1;
      dispatch({
        type: 'CREATE_ROOM',
        payload: { id, name: `채팅 ${roomNumber}` },
      });
      sendMessage(content, id);
    },
    [state.rooms.length, dispatch, sendMessage],
  );

  if (!activeRoom) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white dark:bg-zinc-950">
        <h1 className="mb-8 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          무엇을 도와드릴까요?
        </h1>
        <div className="w-full max-w-2xl">
          <ChatInput onSend={handleWelcomeSend} variant="welcome" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-3 dark:border-zinc-700">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {activeRoom.name}
        </h2>
      </div>
      <MessageList messages={activeRoom.messages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
