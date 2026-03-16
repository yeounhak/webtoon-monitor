'use client';

import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';

export function ChatLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
