// app/test/chat/page.jsx

'use client';

import ChatOverview from '@/app/components/Chat/ChatOverview/ChatOverview';

export default function Chat() {
  console.log('Chat component rendered');

  return (
    <main>
      <ChatOverview />
    </main>
  );
}
