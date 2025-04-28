'use client';
// /app/context/usercontext.js
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import { useCallback } from 'react';

import { getUserSession } from '@/db/publicDb';

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const router = useRouter();

  const [userData, setUserData] = useState({
    authData: {
      image: '/images/default/secret_user_f.png',
    },
    pageData: {},
    socials: {},
  });

  const checkSession = useCallback(async () => {
    const session = await getUserSession();
    console.log('Session result:', session); // ⬅ log immediately

    if (!session) {
      console.warn('No session, redirecting...');
      setTimeout(() => router.push('/login'), 100);
      return;
    }

    console.log('✅ Session found:', session);

    setUserData((prev) => ({
      ...prev,
      authData: {
        ...prev.authData,
        userId: session.user.id,
        name:
          session.user.user_metadata?.name ||
          'Secret user? -.-',
        email: session.user.email,
      },
    }));
  }, [setUserData, router]);

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
