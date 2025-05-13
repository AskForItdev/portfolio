'use client';
// /app/context/usercontext.js
import { useRouter } from 'next/navigation';
import { createContext, useContext, useState } from 'react';
import { useCallback } from 'react';

import { getUserData, getUserSession } from '@/db/publicDb';

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
      return router.push('/login');
    }
    const { data, error } = await getUserData(
      session.user.id
    );
    if (error) {
      // Inget DB-rad → skicka tillbaks till login
      return router.push('/login');
    }
    // Allt OK → spara i context
    setUserData((prev) => ({
      ...prev,
      authData: {
        id: session.user.id,
        email: session.user.email,
        name: data.user_name,
        image: data.profile_image,
      },
    }));
  }, [router]);

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
