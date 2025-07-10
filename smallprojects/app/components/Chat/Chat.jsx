// app/components/Chat/Chat.jsx

'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import BackButton from '@/app/components/Buttons/BackButton';
import HoldDownMenu from '@/app/components/Menus/HoldDownMenu';
import { useHoldTimer } from '@/app/components/Menus/useHoldTimer';
import { playSound } from '@/app/components/PlaySound';
import IconDelete from '@/app/components/SVG/IconDelete';
import IconEdit from '@/app/components/SVG/IconEdit';
import IconPhoneCall from '@/app/components/SVG/IconPhoneCall';
import IconVideo from '@/app/components/SVG/IconVideo';
import { AppProvider } from '@/app/context/appProvider';
import globalStyles from '@/app/styles/global.module.css';
import { getMessages, saveMessage } from '@/db/chat/db';
import chatDatabaseClient, {
  DeleteMessage,
  resetCounter,
  setDeliveredStatus,
  setReadDeliveredStatus,
  setReadStatus,
  updateMessage,
  // other DB functions as needed
} from '@/db/chatdb';

import IconButton from '../Buttons/IconButton';
import ProfileThumb from '../Profile/ProfileThumb';
import styles from './Chat.module.css';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

export default function Chat() {
  const {
    setChatVisible,
    chatVisible,
    chatData,
    setChatData,

    userData,

    setConversationData,
    messageLimit,
    setMessageLimit,
    autoScrollBot,
    setAutoScrollBot,
  } = AppProvider();

  const [menuVisible, setMenuVisible] = useState(false);
  const [clickedMessage, setClickedMessage] =
    useState(null);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [messageEdit, setMessageEdit] = useState(null);
  const [editingMessage, setEditingMessage] =
    useState(null);

  const chatContainerRef = useRef(null);
  const [atTop, setAtTop] = useState(false);
  const [scrollAdjust, setScrollAdjust] = useState(null);
  const [holdDownMenuButtons, setHoldDownMenuButtons] =
    useState([]);

  // MARK: Subscribe use-effect för meddelanden
  useEffect(() => {
    if (!userData || !chatData) return;
    console.log('Chat Data: ', chatData);
    resetCounter(userData.authData.id, chatData?.chatId);

    const insertChannel = chatDatabaseClient
      .channel('chat-new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatData.chatId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          console.log('New message received:', newMsg);

          // Only append if it's not already in the messages array
          setChatData((prev) => {
            const messageExists = prev.messages.some(
              (msg) => msg.id === newMsg.id
            );
            if (messageExists) return prev;

            return {
              ...prev,
              messages: [...(prev.messages || []), newMsg],
            };
          });
          if (newMsg.user_uuid === userData.authData.id) {
            setDeliveredStatus(
              newMsg.id,
              userData.authData.id
            );
            console.log(
              'Message delivered set 💚:',
              newMsg.id
            );
          }

          if (newMsg.user_uuid !== userData.authData.id) {
            setReadStatus(newMsg.chat_id);
            console.log(
              'Messages for chat set to read 💚:',
              newMsg.chat_id
            );
          }
          // Update conversation list
          setConversationData((prev) =>
            prev.map((chat) =>
              chat.chatId === newMsg.chat_id
                ? {
                    ...chat,
                    lastMessage: newMsg.content,
                    last_message_time: newMsg.created_at,
                  }
                : chat
            )
          );
        }
      )
      .subscribe();

    return () => {
      chatDatabaseClient.removeChannel(insertChannel);
    };
  }, [
    userData,
    chatVisible,
    chatData,
    setConversationData,
  ]);
  // MARK: Subscribe use-effect för updates
  useEffect(() => {
    if (!userData || !chatData) return;

    const updateChannel = chatDatabaseClient
      .channel('message-update-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatData.chatId}`,
        },
        (payload) => {
          console.log(
            '[UPDATE] event for message:',
            payload.new
          );
          const updatedMsg = payload.new; // The updated message from Supabase
          console.log('Message updated:', updatedMsg);

          // ✅ 1) Update the message in the currently open chat
          if (payload.new.type === 'deleted') {
            setChatData((prev) => {
              const updatedType = prev.messages.map(
                (msg) =>
                  msg.id === updatedMsg.id
                    ? { ...msg, type: 'deleted' }
                    : msg
              );
              return {
                ...prev,
                messages: updatedType,
              };
            });
          }
          if (payload.new.type === 'text') {
            setChatData((prev) => {
              const updatedMessages = prev.messages.map(
                (msg) =>
                  msg.id === updatedMsg.id
                    ? {
                        ...msg,
                        content: updatedMsg.content,
                      }
                    : msg
              );
              return {
                ...prev,
                messages: updatedMessages,
              };
            });
          }
          if (payload.old.is_read !== payload.new.is_read) {
            setChatData((prev) => {
              const updatedMessages = prev.messages.map(
                (msg) =>
                  msg.id === updatedMsg.id
                    ? {
                        ...msg,
                        is_read: updatedMsg.is_read,
                      }
                    : msg
              );
              return {
                ...prev,
                messages: updatedMessages,
              };
            });
          }
          if (
            payload.old.is_delivered !==
            payload.new.is_delivered
          )
            setChatData((prev) => {
              const updatedMessages = prev.messages.map(
                (msg) =>
                  msg.id === updatedMsg.id
                    ? {
                        ...msg,
                        is_delivered:
                          updatedMsg.is_delivered,
                      }
                    : msg
              );
              return {
                ...prev,
                messages: updatedMessages,
              };
            });
        }
      )
      .subscribe();

    return () => {
      chatDatabaseClient.removeChannel(updateChannel);
    };
  }, [
    userData,
    chatData,
    setChatData,
    setConversationData,
  ]);
  useLayoutEffect(() => {
    if (!scrollAdjust || !chatContainerRef.current) return;

    const container = chatContainerRef.current;
    const newHeight = container.scrollHeight;
    const diff = newHeight - scrollAdjust.heightBefore;

    container.scrollTop = scrollAdjust.topBefore + diff;

    setScrollAdjust(null);
  }, [chatData?.messages]);
  const handleScroll = () => {
    const top = chatContainerRef.current?.scrollTop || 0;
    setAtTop(top <= 10);
  };
  // MARK:load older messages
  const loadOlderMessages = async () => {
    const container = chatContainerRef.current;
    if (!container || !chatData?.chatId) return;

    setAutoScrollBot(false);

    // Spara scrollposition
    const previousScrollHeight = container.scrollHeight;
    const previousScrollTop = container.scrollTop;

    const newLimit = messageLimit + 10;
    setMessageLimit(newLimit);

    const res = await getMessages(
      chatData.chatId,
      newLimit
    );
    if (!res.error) {
      // Sätt flagga för korrigering efter render
      setScrollAdjust({
        heightBefore: previousScrollHeight,
        topBefore: previousScrollTop,
      });

      setChatData((prev) => ({
        ...prev,
        messages: res.data,
      }));
    }
  };
  // Initial fetch of messages
  useEffect(() => {
    if (chatVisible && chatData?.chatId) {
      getMessages(chatData.chatId, messageLimit).then(
        (res) => {
          if (res.error) {
            console.error('res error', res.error);
          } else {
            // Replace local messages with the fresh DB data

            console.log('getmessages "res":', res.data);

            setChatData((prev) => ({
              ...prev,
              messages: res.data,
            }));
          }
        }
      );
      setReadDeliveredStatus(
        chatData.chatId,
        userData.authData.id
      );
    }
  }, [chatVisible, chatData?.chatId, messageLimit]);

  useEffect(() => {
    // Varje gång chatData.messages uppdateras, scrolla ned
    if (chatData?.messages && autoScrollBot) {
      scrollToBottom();
    }
  }, [chatData?.messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  };

  const handleShortPress = async (chat) => {};

  const handleDeleteMessage = useCallback(
    (msg) => {
      // msg är det exakta message-objektet från longPress
      if (msg.user_uuid !== userData.authData.id) return;
      DeleteMessage(msg.id);

      setMenuVisible(false);
    },
    [userData, settingsSound]
  );

  const handleEditMessage = useCallback(
    (msg) => {
      if (msg.user_uuid !== userData.authData.id) return;
      setEditingMessage(msg);

      setMenuVisible(false);
    },
    [userData, settingsSound]
  );

  const handleMessageEdit = async (newContent) => {
    if (!editingMessage) return;

    const { data, error } = await updateMessage(
      editingMessage.id,
      newContent
    );
    if (error) {
      console.error('Error updating message:', error);
      return;
    }

    setChatData((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === editingMessage.id
          ? { ...msg, content: newContent }
          : msg
      ),
    }));

    // Clear editing state
    setEditingMessage(null);
  };

  const handleLongPress = useCallback(
    (message) => {
      if (
        message.user_uuid !== userData.authData.id ||
        message.type === 'deleted'
      )
        return;

      // Bygg knapp-listan med closures som fångar just detta `message`
      const buttons = [
        {
          icon: <IconDelete />,
          text: 'Ta bort',
          action: () => handleDeleteMessage(message),
        },
      ];

      if (message.type === 'text') {
        buttons.push({
          icon: <IconEdit />,
          text: 'Redigera',
          action: () => handleEditMessage(message),
        });
      }

      setHoldDownMenuButtons(buttons);
      setMenuVisible(true);
    },
    [userData, handleDeleteMessage, handleEditMessage]
  );

  const {
    handleTouchMove,
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  } = useHoldTimer(
    null,
    handleLongPress,
    handleShortPress,
    300
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim() && !isRecording) return;

    if (editingMessage) {
      // Handle message edit
      onMessageSent(message);
      setMessage('');
      return;
    }

    // Handle new message
    const newMessage = {
      id: Date.now(),
      content: message,
      type: 'text',
      user_uuid: userData.authData.id,
    };

    const { error } = await saveMessage(
      chatId,
      newMessage,
      userData.authData.id
    );
    if (error) {
      console.error('Error saving message:', error);
      return;
    }

    setMessage('');
  };

  if (!chatVisible) return null;
  if (chatData === null) {
    alert('No chat data available');
    setChatVisible(false);
    return null;
  }

  return (
    <>
      <HoldDownMenu
        data={clickedMessage}
        buttons={holdDownMenuButtons}
        visible={menuVisible}
        setShow={setMenuVisible}
      />
      <div
        className={`${styles.main} ${globalStyles.fixedPosition} ${styles.chatContainer} `}
      >
        <div className={styles.chat}>
          <div
            className={`${styles.header} ${styles.headerSmallLeft}`}
          >
            <BackButton
              src={chatData.thumb}
              online={chatData.online}
              buttonStyle="smallarrow"
              onClick={() => setChatVisible(false)}
            />
            <div className={styles.chatHeader}>
              <ProfileThumb
                src={chatData.thumb}
                size="small"
                online={chatData.online}
                sound={false}
              />
              <div className={styles.chatName}>
                <h3>{chatData.name}</h3>{' '}
              </div>
            </div>
            <div className={styles.chatMenu}>
              <IconButton
                icon={
                  <IconVideo className={styles.iconVideo} />
                }
              />
              <IconButton
                icon={
                  <IconPhoneCall
                    className={styles.iconPhoneCall}
                  />
                }
              />
            </div>
          </div>
          <div className={styles.mainContainer}>
            <div
              className={styles.mainContent}
              ref={chatContainerRef}
              onScroll={handleScroll}
            >
              {atTop &&
                chatData.messages?.length === 10 && (
                  <button
                    className={styles.topButton}
                    onClick={loadOlderMessages}
                  >
                    Ladda fler
                  </button>
                )}
              {chatData &&
                chatData.messages &&
                chatData.messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    name={chatData.name}
                    onTouchStart={(e) =>
                      handleTouchStart(e, message)
                    }
                    onTouchEnd={(e) =>
                      handleTouchEnd(e, message)
                    }
                    onTouchCancel={handleTouchCancel}
                    onMouseDown={(e) =>
                      handleMouseDown(e, message)
                    }
                    onMouseUp={(e) =>
                      handleMouseUp(e, message)
                    }
                    onContextMenu={(e) =>
                      e.preventDefault()
                    }
                    onTouchMove={(e) =>
                      handleTouchMove(e, message)
                    }
                    messageEdit={messageEdit}
                  />
                ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <ChatInput
            ref={inputRef}
            chatId={chatData?.chatId}
            onMessageSent={handleMessageEdit}
            editingMessage={editingMessage}
            onCancelEdit={() => setEditingMessage(null)}
          />
        </div>
      </div>
    </>
  );
}
