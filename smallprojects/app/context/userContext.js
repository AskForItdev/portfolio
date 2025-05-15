'use client';
// /app/context/usercontext.js
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import { useCallback, useEffect } from 'react';

import { getUserSession } from '@/db/publicDb';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const router = useRouter();

  const [userData, setUserData] = useState({
    authData: {
      // id: null,
      // email: null,
      // image: null,
      // name: null,
    },
    userStats: {},
    // socials: {},
  });

  const checkSession = useCallback(async () => {
    const session = await getUserSession();
    console.log('Session result:', session);
    if (!session) {
      router.push('/login');
      return;
    }
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
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        checkSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};
