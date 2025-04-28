'use client';
// app/page.jsx
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useUserContext } from '@/app/context/userContext';

export default function Start() {
  const { checkSession, userData } = useUserContext();
  const router = useRouter();
  const [sessionChecked, setSessionChecked] =
    useState(false);
  useEffect(() => {
    const runCheck = async () => {
      await checkSession();
      setSessionChecked(true);
    };
    runCheck();
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;

    if (userData.personalData?.userId) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [sessionChecked, userData, router]);

  return <div>Validating session</div>;
}
