'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useThemeContext } from '@/app/context/appProvider';

import Header from './Header/header';

export default function HeaderWrapper() {
  const { setHeaderType } = useThemeContext();
  const pathname = usePathname();
  const hideOnPaths = [
    '/login',
    '/signup',
    '/',
    '/validaterd',
  ];
  const hidden = hideOnPaths.includes(pathname);

  const lastSetRef = useRef(null);

  useEffect(() => {
    const newType =
      pathname === '/projects/smaskaligt'
        ? 'hide'
        : 'header';

    // Undvik att sätta samma state flera gånger
    if (lastSetRef.current !== newType) {
      setHeaderType(newType);
      lastSetRef.current = newType;
    }
  }, [pathname, setHeaderType]);

  return (
    <div className={hidden ? 'hidden' : ''}>
      {!hidden && <Header />}
    </div>
  );
}
