'use client';

import { useCallback, useRef } from 'react';
import { useChatState, useChatDispatch } from '@/contexts/ChatContext';
import type { StreamEvent } from '@/types/chat';

export function useChat() {
  const state = useChatState();
  const dispatch = useChatDispatch();
  const abortRef = useRef<AbortController | null>(null);

  const activeRoom = state.rooms.find((r) => r.id === state.activeRoomId);
  const isStreaming = activeRoom?.messages.some((m) => m.isStreaming) ?? false;

  const sendMessage = useCallback(
    async (content: string) => {
      const roomId = state.activeRoomId;
      if (!roomId || !content.trim()) return;

      // Abort previous stream
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMessageId = crypto.randomUUID();
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          roomId,
          message: {
            id: userMessageId,
            role: 'user',
            content: content.trim(),
            timestamp: Date.now(),
          },
        },
      });

      const assistantMessageId = crypto.randomUUID();
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          roomId,
          message: {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            isStreaming: true,
            timestamp: Date.now(),
          },
        },
      });

      const currentRoom = state.rooms.find((r) => r.id === roomId);
      const history = [
        ...(currentRoom?.messages ?? []).map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user' as const, content: content.trim() },
      ];

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.trim()) continue;
            const event: StreamEvent = JSON.parse(line);

            switch (event.type) {
              case 'text_delta':
                dispatch({
                  type: 'APPEND_TO_MESSAGE',
                  payload: {
                    roomId,
                    messageId: assistantMessageId,
                    text: event.delta,
                  },
                });
                break;
              case 'tool_call_start':
                dispatch({
                  type: 'ADD_TOOL_CALL',
                  payload: {
                    roomId,
                    messageId: assistantMessageId,
                    toolCall: {
                      id: event.toolCallId,
                      toolName: event.toolName,
                      arguments: event.arguments,
                      status: 'calling',
                    },
                  },
                });
                break;
              case 'tool_call_output':
                dispatch({
                  type: 'UPDATE_TOOL_CALL',
                  payload: {
                    roomId,
                    messageId: assistantMessageId,
                    toolCallId: event.toolCallId,
                    updates: {
                      output: event.output,
                      status: 'completed',
                    },
                  },
                });
                break;
              case 'error':
                dispatch({
                  type: 'APPEND_TO_MESSAGE',
                  payload: {
                    roomId,
                    messageId: assistantMessageId,
                    text: `\n\n오류: ${event.message}`,
                  },
                });
                break;
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          dispatch({
            type: 'APPEND_TO_MESSAGE',
            payload: {
              roomId,
              messageId: assistantMessageId,
              text: `오류가 발생했습니다: ${(err as Error).message}`,
            },
          });
        }
      } finally {
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            roomId,
            messageId: assistantMessageId,
            updates: { isStreaming: false },
          },
        });
      }
    },
    [state.activeRoomId, state.rooms, dispatch],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { activeRoom, isStreaming, sendMessage, stopStreaming };
}
