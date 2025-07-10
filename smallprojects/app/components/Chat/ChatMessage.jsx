// app/components/Chat/ChatMessage.jsx
import React, { useState } from 'react';

import {
  formatTime,
  formatTimestamp,
} from '@/app/components/Chat/chatFunctions/formatFunctions';
import AppProvider from '@/app/context/appProvider';
import chatDatabaseClient from '@/db/chatdb';

import styles from './ChatMessage.module.css';

export default function ChatMessage({
  message = null,
  onTouchStart = null,
  onTouchEnd = null,
  onTouchCancel = null,
  onMouseDown = null,
  onMouseUp = null,
  onContextMenu = null,
  messageEdit = null,
}) {
  const { userData } = AppProvider();
  const [imgView, setImgView] = useState(false);
  if (!message) return null;

  const isSentByUser =
    message.user_uuid === userData.authData.id;

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <div className={styles.messageContent}>
            <pre>{message.content}</pre>
            {messageEdit ? (
              <div
                className={styles.editButton}
                onClick={messageEdit}
              >
                Testar
              </div>
            ) : (
              <div></div>
            )}
          </div>
        );

      case 'image':
        return (
          <>
            <img
              src={message.image_thumb || message.content}
              alt="Sent image"
              className={styles.messageImage}
              style={{ cursor: 'pointer' }}
              onClick={() => setImgView(true)}
            />

            {imgView && (
              <div className={styles.imageModal}>
                <div
                  className={styles.modalOverlay}
                  onClick={() => setImgView(false)}
                />
                <div className={styles.modalContent}>
                  <img
                    src={message.content}
                    alt="Full image"
                    className={styles.fullImage}
                  />
                  <button
                    className={styles.closeButton}
                    onClick={() => setImgView(false)}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </>
        );

      case 'recording':
        return (
          <div className={styles.audioContainer}>
            <audio
              controls
              className={styles.audioPlayer}
              src={message.content}
              controlsList="nodownload"
              onLoadedMetadata={(e) => {
                console.log(
                  'Audio metadata loaded:',
                  e.target.duration
                );
              }}
              onLoadedData={(e) => {
                console.log(
                  'Audio data loaded:',
                  e.target.readyState
                );
              }}
              onCanPlay={(e) => {
                console.log(
                  'Audio can play:',
                  e.target.readyState
                );
              }}
              onPlay={(e) => {
                console.log('Audio started playing');
              }}
              onError={(e) => {
                console.error(
                  'Audio playback error:',
                  e.target.error
                );
                // Only try to reload once
                if (!e.target.dataset.reloaded) {
                  e.target.dataset.reloaded = 'true';
                  // Try to refresh the signed URL if it's expired
                  const refreshUrl = async () => {
                    try {
                      const { data: signedUrlData } =
                        await chatDatabaseClient.storage
                          .from('chat-media')
                          .createSignedUrl(
                            `recordings/${message.content.split('/').pop()}`,
                            3600
                          );
                      if (signedUrlData?.signedUrl) {
                        console.log(
                          'Refreshing audio URL:',
                          signedUrlData.signedUrl
                        );
                        e.target.src =
                          signedUrlData.signedUrl;
                        e.target.load();
                      }
                    } catch (error) {
                      console.error(
                        'Error refreshing signed URL:',
                        error
                      );
                    }
                  };
                  refreshUrl();
                }
              }}
              preload="auto"
              crossOrigin="anonymous"
            >
              <source
                src={message.content}
                type="audio/webm;codecs=opus"
              />
              Your browser does not support the audio
              element.
            </audio>
            {message.duration && (
              <span className={styles.audioDuration}>
                {formatTime(message.duration)}
              </span>
            )}
          </div>
        );

      case 'video':
        return (
          <video controls className={styles.messageVideo}>
            <source
              src={message.content}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        );

      case 'file':
        return (
          <a
            href={message.content}
            download
            className={styles.messageFile}
          >
            Download File
          </a>
        );

      case 'link':
        return (
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.messageLink}
          >
            {message.content}
          </a>
        );

      case 'deleted':
        return (
          <a
            href={message.content}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.messageDeleted}
          >
            Message deleted...
          </a>
        );

      default:
        return (
          <div className={styles.messageContent}>
            Unsupported message type
          </div>
        );
    }
  };

  return (
    <div>
      <div
        className={`${styles.message} ${isSentByUser ? styles.messageSent : styles.messageReceived}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onContextMenu={onContextMenu}
      >
        {/* Chat bubble icon */}
        <svg
          width="45"
          height="27"
          viewBox="0 0 45 27"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          className={styles.iconBubble}
        >
          <path
            d="M41 0H-2.28882e-05L20 26.5L41 5.5C45.5 1 46 0 41 0Z"
            className={styles.iconBubbleColor}
          />
        </svg>
        {message.edited_at !== null &&
          message.type !== 'deleted' && (
            <div
              className={`${isSentByUser ? styles.editedContainerSent : styles.editedContainerReceived}`}
            >
              <div className={styles.editedMessage}>
                edited
              </div>
            </div>
          )}
        {renderMessageContent()}

        <div className={styles.messageStatus}>
          <div className={styles.messageTimestamp}>
            {formatTimestamp(message.created_at)}
          </div>
          <div
            className={
              isSentByUser
                ? styles.checkContainer
                : styles.checkContainerHidden
            }
          >
            {message.is_delivered === true && (
              <div className={styles.messageDelivered}>
                ✔
              </div>
            )}
            {message.is_read === true && (
              <div className={styles.messageRead}>✔</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
