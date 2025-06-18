'use client';

import { useState } from 'react';

import { signUpNewUser } from '@/db/publicDb';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // ⛔ prevent form from reloading page

    const redirectTo = `${window.location.origin}/validated`; // ✅ after email confirm

    const { data, error } = await signUpNewUser(
      email,
      password,
      redirectTo
    );

    if (error) {
      console.error('Error signing up:', error.message);
      setMessage(error.message);
      return;
    }

    console.log('User signed up:', data);
    setMessage('Check your email to confirm your account!');
  };

  return (
    <div className="w-80">
      <h2 className="text-xl mb-4">Signup page</h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 max-w-sm"
      >
        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="button">
          Create account
        </button>
        {message && (
          <p className="text-sm mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}
