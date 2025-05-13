'use client';
import React from 'react';
import { useEffect } from 'react';

import { useUserContext } from '@/app/context/appProvider';

import Login from '../components/loginComp';

export default function LoginPage() {
  const { checkSession } = useUserContext();

  useEffect(() => {
    const runCheck = async () => {
      await checkSession();
    };
    runCheck();
  }, [checkSession]);

  return (
    <div>
      <Login />
    </div>
  );
}
