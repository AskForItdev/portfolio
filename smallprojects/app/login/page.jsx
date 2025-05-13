'use client';
import React from 'react';
import { useEffect } from 'react';

import Login from '../components/loginComp';

export default function LoginPage() {
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
