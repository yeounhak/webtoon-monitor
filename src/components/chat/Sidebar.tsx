'use client';

import { useChatState, useChatDispatch } from '@/contexts/ChatContext';
import { RoomItem } from './RoomItem';

export function Sidebar() {
  const state = useChatState();
  const dispatch = useChatDispatch();

  const createRoom = () => {
    const id = crypto.randomUUID();
    const roomNumber = state.rooms.length + 1;
    dispatch({
      type: 'CREATE_ROOM',
      payload: { id, name: `채팅 ${roomNumber}` },
    });
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Chat
        </h1>
        <button
          onClick={createRoom}
          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          title="새 채팅"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        {state.rooms.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
            새 채팅을 시작하세요
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {[...state.rooms].reverse().map((room) => (
              <RoomItem
                key={room.id}
                id={room.id}
                name={room.name}
                isActive={room.id === state.activeRoomId}
                onSelect={() =>
                  dispatch({
                    type: 'SELECT_ROOM',
                    payload: { id: room.id },
                  })
                }
                onDelete={() =>
                  dispatch({
                    type: 'DELETE_ROOM',
                    payload: { id: room.id },
                  })
                }
              />
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
