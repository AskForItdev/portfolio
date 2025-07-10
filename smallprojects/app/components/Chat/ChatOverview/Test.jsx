import React from 'react';
import ChatItem from './ChatItem';
import ChatInput from '../ChatInput';
import Chat from '../Chat';
import ChatItem from './ChatItem';
import ChatMessage from '../ChatMessage';
import ChatOverview from './ChatOverview';
import { LiveContextProvider } from '@/app/context/LiveContext';

export default function ChatLayout() {
    const channels = supabase.channel('custom-insert-channel')
        .on('postgres_changes',
    {  event: 'INSERT',
        schema: 'public',
        table: 'chats' },
        (payload) => {
      console.log('Change received!', payload)
    //   Gör vad du vill med payload här!
    }
  )
  .subscribe()

    return (    
        <LiveContextProvider>
            <ChatOverview>
                <ChatItem />
                <Chat>
                    <ChatMessage />
                    <ChatInput />
                </Chat>
            </ChatOverview>
        </LiveContextProvider>
    );
}
{
    "schema": "public",
    "table": "messages",
    "commit_timestamp": "2025-06-04T19:47:33.846Z",
    "eventType": "INSERT",
    "new": {
        "chat_id": 441,
        "content": "Sjukt najs",
        "created_at": "2025-06-04T19:47:33.84483",
        "edited_at": null,
        "id": 1749066453837,
        "image_thumb": null,
        "is_delivered": true,
        "is_read": false,
        "type": "text",
        "user_uuid": "d1197754-65a4-41c8-9543-3ecc81facadd"
    },
    "old": {},
    "errors": null
}