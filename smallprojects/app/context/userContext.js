'use client';
// /app/context/usercontext.js
import { createContext, useContext, useState } from 'react';
import { useCallback, useEffect } from 'react';

import { getUserSession } from '@/db/publicDb';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    authData: {},
    userStats: {},
  });

  const checkSession = useCallback(async () => {
    try {
      const session = await getUserSession();
      if (session) {
        setUserData((prev) => ({
          ...prev,
          authData: {
            ...prev.authData,
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name,
          },
        }));
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        checkSession,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
