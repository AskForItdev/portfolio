//app/context/LiveContext.jsx

'use client';
import React, {
  createContext,
  useContext,
  useState,
} from 'react';

// Create a context
const LiveContext = createContext();

// Create a provider component
export const LiveContextProvider = ({ children }) => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chatData, setChatData] = useState();

  const [conversationData, setConversationData] = useState(
    []
  );

  const [videoChat, setVideoChat] = useState(false);
  const [phoneCall, setPhoneCall] = useState(false);
  const [videoChatOverlay, setVideoChatOverlay] =
    useState(false);
  const [messageLimit, setMessageLimit] = useState(10);
  const [autoScrollBot, setAutoScrollBot] = useState(true);
  function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/;`;
  }

  return (
    <LiveContext.Provider
      value={{
        videoChat,
        setVideoChat,
        phoneCall,
        setPhoneCall,
        videoChatOverlay,
        setVideoChatOverlay,
        chatData,
        setChatData,
        chatVisible,
        setChatVisible,
        conversationData,
        setConversationData,
        deleteCookie,
        messageLimit,
        setMessageLimit,
        autoScrollBot,
        setAutoScrollBot,
      }}
    >
      {children}
    </LiveContext.Provider>
  );
};

// Custom hook to use the context
export const useLiveContext = () => {
  return useContext(LiveContext);
};
