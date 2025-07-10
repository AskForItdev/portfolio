// db/chat/db.js
import { createClient } from '@supabase/supabase-js';

import { userNames } from '@/db/publicDb';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const chatDatabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY,
  {
    db: { schema: 'chat' },
  }
);

export default chatDatabaseClient;

/* ---------------------------------------------------------------------------
   Authentication Functions
--------------------------------------------------------------------------- */

// ─────────────────────────────────────────────────────────────────────
//  Chat/User setup
// ─────────────────────────────────────────────────────────────────────

// MARK: getAllUsers

// MARK: getChatsOnLogin
export async function getChatsOnLogin(my_id) {
  try {
    const {
      data: participantRows,
      error: participantError,
    } = await chatDatabaseClient
      .from('chat_participants')
      .select('chat_id')
      .eq('user_uuid', my_id)
      .neq('user_active', false);

    if (participantError) {
      console.error(
        'Error from getChatsOnLogin:',
        participantError
      );
      return [];
    }

    if (!participantRows || participantRows?.length === 0) {
      return [];
    }

    const chatIds = participantRows.map(
      (row) => row.chat_id
    );
    const { data: chatDetails, error: detailsError } =
      await getChatDetails(chatIds);
    if (detailsError) {
      console.error(
        'Error fetching chat details:',
        detailsError
      );
      return [];
    }

    const shapedChats = chatDetails.map((chat) => {
      const unreadMessages =
        chat.chat_participants.find(
          (p) => p.user_uuid === my_id
        )?.unread_count || 0;

      let buddy = null;
      chat.chat_participants.forEach((p) => {
        if (p.user_uuid !== my_id) buddy = p.users;
      });

      return {
        chatId: chat.id,
        title: chat.title,
        lastMessage:
          chat.messages?.content || 'No messages',
        lastMessageType: chat.messages?.type || 'text',
        lastMessageTime: chat.last_message_time,
        unreadMessages,
        buddyId: buddy?.id || null,
        name: buddy?.alias || buddy?.username || chat.title,
        thumb: buddy?.thumbnail_url || null,
        online: buddy?.online || false,
      };
    });

    return shapedChats;
  } catch (err) {
    console.error(
      'Unexpected error in getChatsOnLogin:',
      err
    );
    return [];
  }
}

// MARK: getChatDetails
export async function getChatDetails(chatIds) {
  try {
    const { data, error } = await chatDatabaseClient
      .from('chats')
      .select(
        `
        id,
        last_message_id,
        last_message_time,
        messages:messages!chats_last_message_id_fkey (
          id, 
          content, 
          user_uuid, 
          created_at,
          type,
          image_thumb
        ),
        chat_participants!inner (
          user_uuid,
          unread_count,
          users (auth_id, username, thumbnail_url, online) )
        )
      `
      )
      .in('id', chatIds)
      .order('last_message_time', { ascending: false });
    if (error) {
      console.error('Error fetching chat details:', error);
      return { error: error.message };
    }
    console.log('Chat details:', data);
    return { data };
  } catch (error) {
    console.error(
      'Unexpected error fetching chat details:',
      error
    );
    return { error: error.message };
  }
}

// MARK: checkForChat()
export async function checkForChat(my_id, buddy_id) {
  const { data, error } = await chatDatabaseClient
    .from('chat_participants')
    .select('chat_id')
    .eq('user_uuid', my_id);
  if (error) return { error: 'No active chats found' };
  if (!data || data?.length === 0) return { data: null };

  const chatIds = data.map((row) => row.chat_id);

  const { data: commonChat, error: commonChatError } =
    await chatDatabaseClient
      .from('chat_participants')
      .select('chat_id')
      .in('chat_id', chatIds)
      .eq('user_uuid', buddy_id)
      .maybeSingle();
  if (commonChatError)
    return { error: commonChatError.message };
  console.log('Common chat:', commonChat);
  return { data: commonChat?.chat_id || null };
}

// MARK: setParticipantInactive()
export async function setParticipantActive(my_id, chatId) {
  const { data, error } = await chatDatabaseClient
    .from('chat_participants')
    .update({ user_active: true })
    .eq('user_uuid', my_id)
    .eq('chat_id', chatId);
  if (error) return { error: error.message };
  return { data };
}

// MARK: createChat()
export async function createChat(my_id, buddy_id) {
  const { data, error } = await chatDatabaseClient
    .from('chats')
    .insert({
      created_by: my_id,
    })
    .select()
    .single();
  if (error) return { error };
  return { data };
}

// MARK: addChatParticipants
export async function addChatParticipants(
  chatId,
  my_id,
  buddy_id
) {
  const { data: names, error: namesError } =
    await userNames(my_id, buddy_id);
  if (namesError) return { error: namesError };

  console.log('user-names fetched:', names);

  const myUser = names.find(
    (user) => user.user_id === my_id
  );
  const buddyUser = names.find(
    (user) => user.user_id === buddy_id
  );

  const { data, error } = await chatDatabaseClient
    .from('chat_participants')
    .insert([
      {
        user_uuid: my_id,
        user_active: true,
        chat_id: chatId,
        user_name: myUser.user_name,
        // alias: myUser.alias,
      },
      {
        user_uuid: buddy_id,
        user_active: false,
        chat_id: chatId,
        user_name: buddyUser.user_name,
        // alias: buddyUser.alias,
      },
    ])
    .select('instance')
    .eq('chat_id', chatId);
  if (error) return { error };
  return { data };
}

// MARK: getAllActiveChats()
export async function getAllActiveChats(my_id) {
  const { data, error } = await chatDatabaseClient
    .from('chat_participants')
    .select('chat_id')
    .eq('user_uuid', my_id)
    .neq('user_active', false);
  if (data.length === 0) {
    console.log(
      'Empty array returned from getAllActiveChats',
      data
    );
    return data;
  } else if (data) {
    console.log(
      'Existing chats from getAllActiveChats',
      data
    );
    return data;
  }
  if (error) {
    console.log('Error from getAllActiveChats', error);
    return error;
  }
}

// MARK: getMessages()
export async function getMessages(chatId, limit) {
  const { data, error } = await chatDatabaseClient
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error(
      'Error fetching messages:',
      error.message
    );
    return { error: error.message };
  }
  return { data: data.reverse() };
}

// fetchLastMessage()
export async function fetchLastMessage(chatId) {
  const { data: chatRow, error } = await chatDatabaseClient
    .from('chats')
    .select(
      `
      id,
      last_message_id,
      last_message_time,
      messages:messages!chats_last_message_id_fkey (
        id,
        content,
        user_uuid,
        created_at,
        type,
        image_thumb
      )
    `
    )
    .eq('id', chatId)
    .single(); // Only one chat row

  if (error || !chatRow) {
    console.error('Error fetching last message:', error);
    // Return something so caller doesn't crash
    return { chatRow: null, error };
  }

  return { chatRow, error: null };
}

// MARK: saveMessage()
export async function saveMessage(
  chatId,
  newMessage,
  userId
) {
  // 1) Create the message in the database
  console.log('New message', newMessage);
  const { data: message, error: insertError } =
    await chatDatabaseClient
      .from('messages')
      .insert({
        id: newMessage.id,
        chat_id: chatId,
        user_uuid: userId,
        content: newMessage.content,
        type: newMessage.type,
        image_thumb: newMessage.image_thumb,
        is_delivered: true,
      })
      .select('*')
      .single();
  if (insertError) return { error: insertError.message };

  // 2) Get the recipient's chat participant record
  const {
    data: recipientParticipant,
    error: recipientError,
  } = await chatDatabaseClient
    .from('chat_participants')
    .select('user_uuid, unread_count')
    .eq('chat_id', chatId)
    .neq('user_uuid', userId)
    .single();

  if (recipientError) {
    console.error(
      'Error getting recipient participant:',
      recipientError
    );
    return { error: recipientError.message };
  }

  if (!recipientParticipant) {
    const { data: senderInfo, error: senderError } =
      await chatDatabaseClient
        .from('users')
        .select('username')
        .eq('user_id', userId)
        .single();

    if (senderError) {
      console.error(
        'Error getting sender info:',
        senderError
      );
      return { error: senderError.message };
    }

    // Create chat participant record for recipient
    const { error: createParticipantError } =
      await chatDatabaseClient
        .from('chat_participants')
        .insert({
          user_uuid: recipientParticipant.user_uuid,
          chat_id: chatId,
          user_active: true,
          unread_count: 1,
          user_name: senderInfo.username,
          alias: senderInfo.alias,
        });

    if (createParticipantError) {
      console.error(
        'Error creating recipient participant:',
        createParticipantError
      );
      return { error: createParticipantError.message };
    }
  } else {
    // 4) Update existing recipient's unread count and active status
    const { data: increment, error: incrementError } =
      await chatDatabaseClient
        .from('chat_participants')
        .update({
          unread_count:
            (recipientParticipant.unread_count || 0) + 1,
          user_active: true,
        })
        .eq('chat_id', chatId)
        .eq('user_uuid', recipientParticipant.user_uuid)
        .select('unread_count');

    if (incrementError) {
      console.error(
        'Error updating unread count:',
        incrementError
      );
      return { error: incrementError.message };
    }
  }

  // 5) Update chat's last message info
  const { error: chatUpdateError } =
    await chatDatabaseClient
      .from('chats')
      .update({
        last_message_id: message.id,
        last_message_time: message.created_at,
      })
      .eq('id', chatId);

  if (chatUpdateError) {
    console.error(
      'Error updating chat last message:',
      chatUpdateError
    );
    return { error: chatUpdateError.message };
  }

  return { message };
}

// MARK: uploadFileToStorage
export async function uploadFileToStorage(
  bucket,
  path,
  file
) {
  // 1) Upload
  let { error } = await chatDatabaseClient.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) return { error: error.message };

  // 2) Public URL (if bucket public) or fallback
  const { data: pub, error: pubErr } =
    chatDatabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);

  if (pubErr) return { error: pubErr.message };

  return { publicUrl: pub.publicUrl };
}

// MARK: resetCounter
export async function resetCounter(my_id, chatId) {
  const { data, error } = await chatDatabaseClient
    .from('chat_participants')
    .update({ unread_count: 0 })
    .eq('chat_id', chatId)
    .eq('user_uuid', my_id);
  if (error) return { error: error.message };
  return { data };
}

// MARK: DeleteMessage()
export async function DeleteMessage(messageId) {
  const { data, error } = await chatDatabaseClient
    .from('messages')
    .update({ type: 'deleted' })
    .eq('id', messageId);
  if (error) return { error: error.message };
  return { data };
}

// MARK: activeUserFalse()
export async function activeUserFalse(my_id, chatId) {
  const { data, error } = await chatDatabaseClient
    .from('chat_participants')
    .update({ user_active: false })
    .eq('user_uuid', my_id)
    .eq('chat_id', chatId);
  if (error) return { error: error.message };
  return { data };
}

// MARK: saveEditedMessage
export async function saveEditedMessage(originalMessage) {
  const { data, error } = await chatDatabaseClient
    .from('edited_messages')
    .insert({
      chat_id: originalMessage.chat_id,
      content: originalMessage.content,
      type: originalMessage.type,
      is_read: originalMessage.is_read,
      created_at: originalMessage.created_at,
      user_uuid: originalMessage.user_uuid,
      image_thumb: originalMessage.image_thumb,
    })
    .select();

  if (error) return { error: error.message };
  return { data };
}

// MARK: updateMessage
export async function updateMessage(messageId, newContent) {
  try {
    // First get the original message
    const { data: originalMessage, error: fetchError } =
      await chatDatabaseClient
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single();

    if (fetchError) {
      console.error(
        'Error fetching original message:',
        fetchError
      );
      return { error: fetchError.message };
    }

    // Save the original message to edited_messages
    const { error: saveError } = await chatDatabaseClient
      .from('edited_messages')
      .insert({
        chat_id: originalMessage.chat_id,
        content: originalMessage.content,
        type: originalMessage.type,
        is_read: originalMessage.is_read,
        created_at: originalMessage.created_at,
        user_uuid: originalMessage.user_uuid,
        image_thumb: originalMessage.image_thumb,
        original_message_id: messageId,
      });

    if (saveError) {
      console.error(
        'Error saving to edited_messages:',
        saveError
      );
      return { error: saveError.message };
    }

    // Update the message with new content
    const { data, error } = await chatDatabaseClient
      .from('messages')
      .update({
        content: newContent,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .select();

    if (error) {
      console.error('Error updating message:', error);
      return { error: error.message };
    }

    return { data };
  } catch (error) {
    console.error(
      'Unexpected error in updateMessage:',
      error
    );
    return { error: error.message };
  }
}

export async function setDeliveredStatus(messageId) {
  const { data, error } = await chatDatabaseClient
    .from('messages')
    .update({ is_delivered: true })
    .eq('id', messageId)
    .select();

  if (error) return { error: error.message };
  return { data };
}

export async function setReadStatus(chat_id, userId) {
  const { data, error } = await chatDatabaseClient
    .from('messages')
    .update({ is_read: true })
    .eq('chat_id', chat_id)
    .neq('user_uuid', userId)
    .select();

  if (error) return { error: error.message };
  return { data };
}

export async function setReadDeliveredStatus(
  chatId,
  userId
) {
  const { data, error } = await chatDatabaseClient
    .from('messages')
    .update({ is_read: true, is_delivered: true })
    .eq('chat_id', chatId)
    .neq('user_uuid', userId)
    .select();

  if (error) return { error: error.message };
  return { data };
}
