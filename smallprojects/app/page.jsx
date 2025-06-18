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
  }, [checkSession]);

  useEffect(() => {
    if (userData.authData?.id) {
      console.log(
        'User session found, redirecting to home -->'
      );
      router.push('/home');
    } else {
      console.log(
        'No user session found, redirecting to login -->'
      );
      router.push('/login');
    }
  }, [sessionChecked, userData.authData?.id, router]);

  return <div>Validating session</div>;
}
