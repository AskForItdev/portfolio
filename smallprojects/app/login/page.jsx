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
    <div className="flex flex-col items-center h-screen bg-gray-100">
      <Login />
    </div>
  );
}
