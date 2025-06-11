'use client';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { useUserContext } from '@/app/context/userContext';

const publicPaths = [
  '/login',
  '/signup',
  '/',
  '/validated',
];

// Create a navigation context
export const NavigationContext = createContext();

export const useNavigation = () => {
  return useContext(NavigationContext);
};

export default function AuthWrapper({ children }) {
  const {
    userData,
    checkSession,
    isLoading: contextLoading,
  } = useUserContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // Handle route changes
  useEffect(() => {
    const handleStart = () => setIsNavigating(true);
    const handleComplete = () => setIsNavigating(false);

    window.addEventListener('beforeunload', handleStart);
    router.events?.on('routeChangeStart', handleStart);
    router.events?.on(
      'routeChangeComplete',
      handleComplete
    );
    router.events?.on('routeChangeError', handleComplete);

    return () => {
      window.removeEventListener(
        'beforeunload',
        handleStart
      );
      router.events?.off('routeChangeStart', handleStart);
      router.events?.off(
        'routeChangeComplete',
        handleComplete
      );
      router.events?.off(
        'routeChangeError',
        handleComplete
      );
    };
  }, [router]);

  useEffect(() => {
    const validateSession = async () => {
      setIsLoading(true);
      await checkSession();
      setIsLoading(false);
    };
    validateSession();
  }, [checkSession]);

  useEffect(() => {
    if (isLoading || contextLoading) return;

    const isPublicPath = publicPaths.includes(pathname);
    const isAuthenticated = !!userData.authData?.id;

    if (!isAuthenticated && !isPublicPath) {
      setIsNavigating(true);
      router.push('/');
      setIsAuthorized(false);
    } else if (
      isAuthenticated &&
      isPublicPath &&
      pathname !== '/home'
    ) {
      setIsNavigating(true);
      router.push('/home');
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
    }
  }, [
    isLoading,
    contextLoading,
    pathname,
    userData.authData?.id,
    router,
  ]);

  if (isLoading || contextLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <NavigationContext.Provider value={{ isNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
}
