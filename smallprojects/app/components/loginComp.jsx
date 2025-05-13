import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useUserContext } from '@/app/context/appProvider';
import { signInWithEmail } from '@/db/publicDb';

export default function Login() {
  const router = useRouter();
  const { setUserData } = useUserContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    const { data, error } = await signInWithEmail(
      email,
      password
    );

    if (error) {
      console.error('Error signing in:', error.message);
      setMessage(error.message);
      return;
    }
    console.log('User signed in:', data);
    setMessage('Login successful!');
    setUserData((prev) => ({
      ...prev,
      authData: {
        ...prev.authData,
        id: data.user.user_id,
        email: data.user.email,
        name: data.user.user_metadata.name,
      },
    }));
    router.push('/');
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Login page</h2>
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
        <button type="submit" className="">
          Login
        </button>
        <Link href="./signup">Sign up</Link>
        {message && (
          <p className="text-sm mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}
