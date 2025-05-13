'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

import Loader from '@/app/components/Loader';
import { getUserStats } from '@/db/publicDb';
import { signOut } from '@/db/publicDb';

import { useUserContext } from '../context/userContext';

export default function ProfilePage() {
  const { userData, checkSession } = useUserContext();
  const router = useRouter();
  useEffect(() => {
    const runCheck = async () => {
      await checkSession();
    };
    runCheck();
  }, [checkSession]);

  const fetchUserStats = useCallback(async () => {
    if (!userData.authData.id) return;
    const { data, error } = await getUserStats(
      userData.authData.id
    );
    if (error) {
      console.log('Failed to fetch user stats', error);
      return;
    }
    if (data) {
      console.log('User stats:', data);
    }
  }, [userData.authData.id]);

  useEffect(() => {
    fetchUserStats(userData.authData.id);
  }, [userData.authData.id, fetchUserStats]);

  return (
    <div>
      <div className="flex flex-col items-center w-full">
        <h2>{userData.authData.name}</h2>
        <div className="imageContainer w-[80px] h-[80px] shadow-lg relative overflow-hidden object-cover rounded-lg">
          {userData?.authData.image ? (
            <Image
              className=""
              src={userData.authData.image}
              alt="User Image"
              width={100}
              height={100}
            />
          ) : (
            <Loader />
          )}
        </div>
        {/* <p>Welcome {userData.authData.name}!</p>
        <p>Your level: {userData.pageData.Level}</p> */}
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
