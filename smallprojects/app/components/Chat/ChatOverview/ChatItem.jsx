'use client';

import { getMessagePreview } from '@/app/components/Chat/chatFunctions/chatFunctions.js';
import { formatTimestamp } from '@/app/components/Chat/chatFunctions/formatFunctions.js';
import ProfileThumb from '@/app/components/chat/Profile/ProfileThumb';

import styles from './ChatItem.module.css';

export default function ChatItem({
  chat = null,
  read = false,

  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  onMouseDown,
  onMouseUp,
  onContextMenu,
}) {
  return (
    <>
      {chat !== null && (
        <div
          className={
            read ? 'chatItem readChatItem' : 'chatItem'
          }
          // onClick={onClick}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchCancel}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onContextMenu={onContextMenu}
        >
          {/* Profile picture with online status */}
          <ProfileThumb
            src={chat.thumb}
            online={chat.online}
            disabled={read}
          />

          {/* Chat details: Name, last message, timestamp */}
          <div className={styles.chatDetails}>
            <h3>{chat.name}</h3>
            <p className="lastMessage">
              {getMessagePreview(
                chat.lastMessage,
                chat.lastMessageType
              )}
            </p>
            {chat.lastMessageTime ? (
              <span>
                {formatTimestamp(chat.lastMessageTime)}
              </span>
            ) : (
              <span>Senast mottagna...</span>
            )}
          </div>

          {/* ✅ Unread messages counter (only shown if unreadMessages > 0) */}
          {chat.unreadMessages > 0 && (
            <span className={styles.unreadMessages}>
              {chat.unreadMessages}
            </span>
          )}
        </div>
      )}
    </>
  );
}
