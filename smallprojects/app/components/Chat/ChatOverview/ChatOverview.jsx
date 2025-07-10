'use client';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import HoldDownMenu from '@/app/components/Chat/chatFunctions/HoldDownMenu';
import { useHoldTimer } from '@/app/components/Chat/chatFunctions/useHoldTimer';
import ChatItem from '@/app/components/Chat/ChatOverview/ChatItem';
import IconDelete from '@/app/components/SVG/IconDelete';
import { useAppContext } from '@/app/context/useAppContext';
import chatDatabaseClient, {
  activeUserFalse,
  addChatParticipants,
  checkForChat,
  createChat,
  fetchLastMessage,
  getChatsOnLogin,
  resetCounter,
  setParticipantActive,
} from '@/db/chatdb';
import {
  getAllUsers,
  signOut,
  userOnline,
} from '@/db/publicDb';

export default function ChatOverview() {
  const {
    setChatVisible,
    chatData,
    setChatData,
    userData,
    setUserData,
    conversationData,
    setConversationData,
    deleteCookie,
    setMessageLimit,
  } = useAppContext();

  const [allUsers, setAllUsers] = useState([]);
  const [unreadChats, setUnreadChats] = useState(0);
  const [readChats, setReadChats] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [clickedId, setClickedId] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // ✅ 1) Track if we need to fetch chats (to avoid direct calls in the subscription)
  const [missingChatId, setMissingChatId] = useState(null);

  // Initialize conversationData as empty array if null
  useEffect(() => {
    if (conversationData === null) {
      setConversationData([]);
    }
  }, [conversationData, setConversationData]);

  // ───────────────────────────────────────────────────────────────────
  // MARK: participant_table subscription
  // ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    userOnline(userData.authData.id, true);
  }, []);

  useEffect(() => {
    if (!userData) return;
    const participantsChannel = chatDatabaseClient
      .channel('participants-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_participants',
          filter: `user_uuid=eq.${userData.authData.id}`,
        },
        async (payload) => {
          console.log(
            'chat_participants payload:',
            payload
          );
          const { new: newData, old: oldData } = payload;

          if (newData.user_uuid !== userData.auth_id)
            return;

          // Check if this chat exists locally
          const currentChat = conversationData.find(
            (chat) => chat.chatId === newData.chat_id
          );

          // If we don't have this chat, handle it or setMissingChatId
          if (!currentChat) {
            setMissingChatId(newData.chat_id);
            return;
          }

          // Determine what changed
          switch (true) {
            case newData.unread_count !==
              oldData.unread_count:
              if (chatData?.chatId !== newData.chat_id) {
                const { chatRow, error } =
                  await fetchLastMessage(newData.chat_id);
                if (!error && chatRow) {
                  console.log(
                    'New message received:',
                    chatRow.messages
                  );
                  setConversationData((prev) =>
                    prev.map((chat) =>
                      chat.chatId === chatRow.id
                        ? {
                            ...chat,
                            unreadMessages:
                              newData.unread_count,
                            lastMessage:
                              chatRow.messages?.type ===
                              'image'
                                ? 'image'
                                : chatRow.messages
                                    ?.content ||
                                  chat.lastMessage,
                            lastMessageType:
                              chatRow.messages?.type ||
                              'text',
                            lastMessageTime:
                              chatRow.messages
                                ?.created_at ||
                              chat.lastMessageTime,
                          }
                        : chat
                    )
                  );
                }
              } else {
                // If user is currently in that chat, reset local unread
                setChatData((prev) => ({
                  ...prev,
                  unreadMessages: 0,
                }));
                resetCounter(
                  userData.auth_id,
                  newData.chat_id
                );
                // Also update the conversation data to reflect the reset
                setConversationData((prev) =>
                  prev.map((chat) =>
                    chat.chatId === newData.chat_id
                      ? { ...chat, unreadMessages: 0 }
                      : chat
                  )
                );
              }
              return;

            case newData.user_active !==
              oldData.user_active:
              console.log('User active state changed');
              setConversationData((prev) =>
                prev.map((chat) =>
                  chat.chatId === newData.chat_id
                    ? {
                        ...chat,
                        online: newData.user_active === 1,
                      }
                    : chat
                )
              );
              return;

            case newData.last_read_message_id !==
              oldData.last_read_message_id:
              console.log('Last read message ID changed');
              return;

            case newData.alias !== oldData.alias:
              console.log('Alias changed');
              return;

            default:
              console.log(
                'Other change detected or no relevant change.'
              );
              return;
          }
        }
      )
      .subscribe();

    // Subscribe to messages changes
    const messagesChannel = chatDatabaseClient
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('New message payload:', payload);
          const { new: newMessage } = payload;

          // Only update if this message is for a chat we're viewing and it's not from us
          if (
            newMessage.user_uuid !== userData.auth_id &&
            conversationData.some(
              (chat) => chat.chatId === newMessage.chat_id
            )
          ) {
            // Get the current chat from conversationData
            const currentChat = conversationData.find(
              (chat) => chat.chatId === newMessage.chat_id
            );

            // Update the chat list with the new message
            setConversationData((prev) =>
              prev.map((chat) =>
                chat.chatId === newMessage.chat_id
                  ? {
                      ...chat,
                      lastMessage:
                        newMessage.type === 'image'
                          ? 'image'
                          : newMessage.content,
                      lastMessageType: newMessage.type,
                      lastMessageTime:
                        newMessage.created_at,
                      // Only increment unread count if we're not in this chat
                      unreadMessages:
                        chatData?.chatId ===
                        newMessage.chat_id
                          ? 0
                          : (currentChat?.unreadMessages ||
                              0) + 1,
                    }
                  : chat
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      chatDatabaseClient.removeChannel(participantsChannel);
      chatDatabaseClient.removeChannel(messagesChannel);
    };
  }, [
    userData,
    chatData,
    conversationData,
    setConversationData,
  ]);

  // ───────────────────────────────────────────────────────────────────
  // ✅ 3) useEffect to fetch missing chats if needed
  // ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!missingChatId || !userData) return;

    console.log('Missing chat found, fetching...');
    getChatsOnLogin(userData.authData.id).then(
      (shapedChats) => {
        setConversationData(shapedChats);
        setUnreadChats(
          shapedChats.filter((c) => c.unreadMessages > 0)
            .length
        );
        setReadChats(
          shapedChats.filter((c) => c.unreadMessages === 0)
            .length
        );
        setMissingChatId(null); // Reset once done
      }
    );
  }, [missingChatId, userData, setConversationData]);

  useEffect(() => {
    // Count unread vs. read whenever conversationData updates
    if (!conversationData) return;

    const unread = conversationData.filter(
      (c) => c.unreadMessages > 0
    ).length;
    const read = conversationData.filter(
      (c) => c.unreadMessages === 0
    ).length;

    setUnreadChats(unread);
    setReadChats(read);
  }, [conversationData]);

  // ───────────────────────────────────────────────────────────────────
  // MARK: getChatsOnLogin() on first mount
  // ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    updateItemList();
  }, []);

  async function updateItemList() {
    console.log('function updateItemList activated');
    if (userData) {
      getChatsOnLogin(userData.authData.id).then(
        (shapedChats) => {
          setConversationData(shapedChats);
          setUnreadChats(
            shapedChats.filter((c) => c.unreadMessages > 0)
              .length
          );
          setReadChats(
            shapedChats.filter(
              (c) => c.unreadMessages === 0
            ).length
          );
        }
      );
    }
  }

  async function handleLogout() {
    await userOnline(userData.authData.id, false);

    await signOut();
    setUserData(null);
    setConversationData(null);
    setUnreadChats(null);
    setReadChats(null);
    setChatVisible(false);
    deleteCookie('user');
    // window.location.reload();
  }

  // ───────────────────────────────────────────────────────────────────
  // MARK: fetchAllUsers() - to start a new chat
  // ───────────────────────────────────────────────────────────────────
  async function fetchAllUsers() {
    if (allUsers?.length > 0) {
      setAllUsers([]);
      return;
    }

    if (!userData) return;

    const { data: allUsersData, error } = await getAllUsers(
      userData.authData.id
    );
    if (error) {
      console.error('Failed to load users:', error);
      return;
    }
    const activeChatUserIds = conversationData.map(
      (chat) => chat.buddyId
    );
    const filtered = allUsersData.filter(
      (user) => !activeChatUserIds.includes(user.id)
    );
    setAllUsers(filtered);
  }

  // ───────────────────────────────────────────────────────────────────
  // MARK: startChat()
  // ───────────────────────────────────────────────────────────────────
  async function startChat(buddyId) {
    const { data: chatExists, error: errorChatExists } =
      await checkForChat(userData.authData.id, buddyId);
    if (errorChatExists) {
      console.error(
        'Failed to check for chat:',
        errorChatExists
      );
    }
    if (chatExists) {
      await setParticipantActive(
        userData.authData.id,
        chatExists
      );
    } else {
      const { data: createdChat, error: errorCreatedChat } =
        await createChat(userData.authData.id, buddyId);
      if (errorCreatedChat) {
        console.error(
          'Failed to create chat:',
          createdChat
        );
      }
      const {
        data: participants,
        error: participantsError,
      } = await addChatParticipants(
        createdChat.id,
        userData.authData.id,
        buddyId
      );
      if (participantsError) {
        console.log(
          'Failed to add chat participants:',
          participantsError
        );
      } else {
        console.log(
          'chat participant-instances created:',
          participants
        );
      }
    }
    setAllUsers([]);
    updateItemList();
  }

  function closeChat() {
    setChatData(null);
    setChatVisible(false);
  }

  // ───────────────────────────────────────────────────────────────────
  // MARK: Press handlers
  // ───────────────────────────────────────────────────────────────────
  const handleShortPress = async (chat) => {
    if (chatData?.chatId === chat.chatId) return;
    setMessageLimit(10);
    setChatVisible(true);
    chat.unreadMessages = 0;
    console.log('Chat data:', chat);
    setChatData(chat);
    setConversationData((prev) =>
      prev.map((c) =>
        c.chatId === chat.chatId
          ? { ...c, unreadMessages: 0 }
          : c
      )
    );
    console.log('Chat data:', chat);
  };

  const handleLongPress = (chat) => {
    setClickedId(chat.chatId);
    console.log('Long press:', chat);
    setMenuVisible(true);
  };

  const handleDeleteConversation = () => {
    console.log('Delete conversation:', clickedId);
    if (clickedId) {
      console.log('Delete conversation:', clickedId);
      setConversationData((prev) =>
        prev.filter((chat) => chat.id !== clickedId)
      );

      activeUserFalse(userData.authData.id, clickedId);
      setMenuVisible(false);
      updateItemList();
    }
  };

  // useHoldTimer for press events
  const {
    handleMouseDown,
    handleMouseUp,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
  } = useHoldTimer(
    setMenuVisible,
    handleLongPress,
    handleShortPress,
    300
  );

  // ───────────────────────────────────────────────────────────────────
  // MARK: Render
  // ───────────────────────────────────────────────────────────────────
  return (
    <>
      <HoldDownMenu
        data={clickedId}
        buttons={[
          {
            icon: <IconDelete />,
            text: 'Ta bort konversation',
            action: handleDeleteConversation,
          },
        ]}
        visible={menuVisible}
        setShow={setMenuVisible}
      />
      <main className="">
        <div className=""></div>
        <div className="">
          <h1>Chat</h1>
          <div></div>
        </div>
        <div className="">
          <div className="">
            {conversationData && unreadChats > 0 && (
              <>
                <h2>
                  Olästa{' '}
                  <span className="">{unreadChats}</span>
                </h2>
                <div style={{ marginBottom: '1.875rem' }}>
                  {conversationData
                    .filter(
                      (chat) =>
                        chat.unreadMessages > 0 ||
                        chat.unreadMessages === null
                    )
                    .map((chat, index) => (
                      <ChatItem
                        key={index}
                        chat={chat}
                        read={chat.unreadMessages === 0}
                        onClick={() =>
                          handleShortPress(chat)
                        }
                        onTouchStart={(e) =>
                          handleTouchStart(e, chat)
                        }
                        onTouchEnd={(e) =>
                          handleTouchEnd(e, chat)
                        }
                        onTouchCancel={handleTouchCancel}
                        onMouseDown={(e) =>
                          handleMouseDown(e, chat)
                        }
                        onMouseUp={(e) =>
                          handleMouseUp(e, chat)
                        }
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleLongPress(chat);
                        }}
                      />
                    ))}
                </div>
              </>
            )}

            {conversationData && (
              <>
                <h2>
                  Lästa{' '}
                  <span className="">{readChats}</span>
                </h2>
                <div style={{ marginBottom: '1.875rem' }}>
                  {conversationData
                    .filter(
                      (chat) => chat.unreadMessages === 0
                    )
                    .map((chat, index) => (
                      <ChatItem
                        key={index}
                        chat={chat}
                        read={true}
                        onClick={() =>
                          handleShortPress(chat)
                        }
                        onTouchStart={(e) =>
                          handleTouchStart(e, chat)
                        }
                        onTouchEnd={(e) =>
                          handleTouchEnd(e, chat)
                        }
                        onTouchCancel={handleTouchCancel}
                        onMouseDown={(e) =>
                          handleMouseDown(e, chat)
                        }
                        onMouseUp={(e) =>
                          handleMouseUp(e, chat)
                        }
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleLongPress(chat);
                        }}
                      />
                    ))}
                </div>
              </>
            )}

            {showAllUsers ? (
              <div
                style={{
                  padding: '10px',
                  marginTop: '300px',
                  border: '1px solid #000',
                  marginBottom: '1.875rem',
                }}
              >
                <button
                  style={{}}
                  onClick={() => setShowAllUsers(false)}
                >
                  <Plus size={18} />
                </button>
                <h2>
                  Alla Användare (ez access till users)
                </h2>
                <div>
                  <div style={{ padding: '1rem' }}>
                    <p>
                      Välkommen, {userData.authData.email}
                    </p>
                    <button onClick={handleLogout}>
                      Logga ut
                    </button>
                    <button onClick={fetchAllUsers}>
                      Hämta
                    </button>
                    <button onClick={closeChat}>
                      Stäng chat
                    </button>
                  </div>

                  <ul
                    style={{
                      listStyle: 'none',
                      padding: '10px',
                    }}
                  >
                    {allUsers.length > 0 ? (
                      allUsers.map((user, index) => (
                        <li
                          key={index}
                          style={{ padding: '2px' }}
                        >
                          <button
                            onClick={() =>
                              startChat(user.user_id)
                            }
                            style={{
                              display: 'flex',
                              width: '80%',
                              borderRadius: '5px',
                            }}
                          >
                            <Image
                              src={
                                user.profile_image ||
                                '/default-avatar.png'
                              }
                              alt={user.user_name}
                              width={40}
                              height={40}
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                              }}
                            />
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                flexDirection: 'column',
                                margin: '0 10px 0 10px',
                              }}
                            >
                              <span>
                                {'id: ' +
                                  user.user_id +
                                  ' '}
                              </span>
                              <span>
                                {user.alias ||
                                  user.username}
                              </span>
                              {user.online ? (
                                <span
                                  style={{ color: 'green' }}
                                >
                                  {' '}
                                  ● Online
                                </span>
                              ) : (
                                <span
                                  style={{ color: 'gray' }}
                                >
                                  {' '}
                                  ● Offline
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      ))
                    ) : (
                      <p>Hämta användare</p>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <button
                style={{
                  padding: '1px',
                  margin: '285px 0 0 10px',
                  border: '1px solid #000',
                  marginBottom: '1.875rem',
                }}
                onClick={() => setShowAllUsers(true)}
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </div>
      </main>
      <div className=""></div>
    </>
  );
}
