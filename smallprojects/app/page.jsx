'use client';
// app/page.js

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// eslint-disable-next-line no-unused-vars
import Header from './components/Header/header';
import { useUserContext } from './context/userContext';

export default function Start() {
  const { userData } = useUserContext();
  const id = userData?.personalData?.userId;
  const router = useRouter();

  useEffect(() => {
    if (!id) {
      router.push('/login');
    }
    if (id) {
      router.push('/home');
    }
  }, [id, router]);

  return <div>Validating login</div>;
}
