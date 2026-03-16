'use client';

import {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { Message, Room, ToolCallInfo } from '@/types/chat';

interface ChatState {
  rooms: Room[];
  activeRoomId: string | null;
}

type ChatAction =
  | { type: 'CREATE_ROOM'; payload: { id: string; name: string } }
  | { type: 'DELETE_ROOM'; payload: { id: string } }
  | { type: 'SELECT_ROOM'; payload: { id: string } }
  | { type: 'ADD_MESSAGE'; payload: { roomId: string; message: Message } }
  | {
      type: 'UPDATE_MESSAGE';
      payload: { roomId: string; messageId: string; updates: Partial<Message> };
    }
  | {
      type: 'APPEND_TO_MESSAGE';
      payload: { roomId: string; messageId: string; text: string };
    }
  | {
      type: 'ADD_TOOL_CALL';
      payload: { roomId: string; messageId: string; toolCall: ToolCallInfo };
    }
  | {
      type: 'UPDATE_TOOL_CALL';
      payload: {
        roomId: string;
        messageId: string;
        toolCallId: string;
        updates: Partial<ToolCallInfo>;
      };
    };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'CREATE_ROOM': {
      const newRoom: Room = {
        id: action.payload.id,
        name: action.payload.name,
        messages: [],
        createdAt: Date.now(),
      };
      return {
        ...state,
        rooms: [...state.rooms, newRoom],
        activeRoomId: newRoom.id,
      };
    }
    case 'DELETE_ROOM': {
      const rooms = state.rooms.filter((r) => r.id !== action.payload.id);
      return {
        ...state,
        rooms,
        activeRoomId:
          state.activeRoomId === action.payload.id
            ? rooms[rooms.length - 1]?.id ?? null
            : state.activeRoomId,
      };
    }
    case 'SELECT_ROOM':
      return { ...state, activeRoomId: action.payload.id };
    case 'ADD_MESSAGE':
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.payload.roomId
            ? { ...r, messages: [...r.messages, action.payload.message] }
            : r,
        ),
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.payload.roomId
            ? {
                ...r,
                messages: r.messages.map((m) =>
                  m.id === action.payload.messageId
                    ? { ...m, ...action.payload.updates }
                    : m,
                ),
              }
            : r,
        ),
      };
    case 'APPEND_TO_MESSAGE':
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.payload.roomId
            ? {
                ...r,
                messages: r.messages.map((m) =>
                  m.id === action.payload.messageId
                    ? { ...m, content: m.content + action.payload.text }
                    : m,
                ),
              }
            : r,
        ),
      };
    case 'ADD_TOOL_CALL':
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.payload.roomId
            ? {
                ...r,
                messages: r.messages.map((m) =>
                  m.id === action.payload.messageId
                    ? {
                        ...m,
                        toolCalls: [
                          ...(m.toolCalls ?? []),
                          action.payload.toolCall,
                        ],
                      }
                    : m,
                ),
              }
            : r,
        ),
      };
    case 'UPDATE_TOOL_CALL':
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.id === action.payload.roomId
            ? {
                ...r,
                messages: r.messages.map((m) =>
                  m.id === action.payload.messageId
                    ? {
                        ...m,
                        toolCalls: m.toolCalls?.map((tc) =>
                          tc.id === action.payload.toolCallId
                            ? { ...tc, ...action.payload.updates }
                            : tc,
                        ),
                      }
                    : m,
                ),
              }
            : r,
        ),
      };
    default:
      return state;
  }
}

const initialState: ChatState = {
  rooms: [],
  activeRoomId: null,
};

const ChatStateContext = createContext<ChatState>(initialState);
const ChatDispatchContext = createContext<Dispatch<ChatAction>>(() => {});

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatStateContext value={state}>
      <ChatDispatchContext value={dispatch}>{children}</ChatDispatchContext>
    </ChatStateContext>
  );
}

export function useChatState() {
  return useContext(ChatStateContext);
}

export function useChatDispatch() {
  return useContext(ChatDispatchContext);
}
