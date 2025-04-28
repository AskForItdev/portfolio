'use client';
import { usePathname } from 'next/navigation';

import Header from './Header/header';

export default function HeaderWrapper() {
  const pathname = usePathname();
  const hideOnPaths = [
    '/login',
    '/signup',
    '/',
    '/validaterd',
  ];
  const hidden = hideOnPaths.includes(pathname);

  return (
    <div className={hidden ? 'hidden' : ''}>
      {!hidden && <Header />}
    </div>
  );
}
