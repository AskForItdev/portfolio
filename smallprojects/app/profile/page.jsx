'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { signOut } from '@/db/publicDb';

import { useUserContext } from '../context/userContext';
export default function ProfilePage() {
  const { userData } = useUserContext();
  const router = useRouter();
  return (
    <div>
      <div className="flex flex-col items-center w-full">
        <h2>{userData.authData.name}</h2>
        <Image
          className="w-[80px] h-[80px] relative overflow-hidden object-cover rounded-lg"
          src={userData.authData.image || '/images/2.png'}
          alt="User Image"
          height={100}
          width={100}
        ></Image>
        <p>Welcome {userData.authData.name}!</p>
        <p>Your level: {userData.pageData.Level}</p>
        <button
          className="mt-10"
          onClick={() => signOut().then(router.push('/'))}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
