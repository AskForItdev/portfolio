'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';

import Button from '@/app/components/Button';
import Loader from '@/app/components/Loader';
import { getUserStats } from '@/db/publicDb';
import { createUserStats, signOut } from '@/db/publicDb';

import { useUserContext } from '../context/userContext';

export default function ProfilePage() {
  const { userData, setUserData } = useUserContext();
  const router = useRouter();

  const fetchUserStats = useCallback(async () => {
    if (!userData.authData.id) return;
    const { data, error } = await getUserStats(
      userData.authData.id
    );
    if (error) {
      console.log('Failed to fetch user stats', error);
      if (error?.code === 'PGRST116') {
        const { data: createData, error: createError } =
          await createUserStats(userData.authData.id);
        if (createError) {
          console.log(
            'Failed to create user_stats row',
            createError
          );
          return;
        }
        if (createData) {
          console.log('User stats recieved:', createData);
          setUserData((prev) => ({
            ...prev,
            userStats: {
              ...prev.userStats,
              level: createData?.user_level,
            },
          }));
        }
      }
      return;
    }
    if (data) {
      setUserData((prev) => ({
        ...prev,
        userStats: {
          ...prev.userStats,
          level: data?.user_level,
        },
      }));
    }
  }, [userData.authData.id, setUserData]);

  useEffect(() => {
    if (userData.authData.id) {
      fetchUserStats();
    }
  }, [userData.authData.id, fetchUserStats]);

  const handleSignOut = async () => {
    // Clear user data first
    setUserData({
      authData: {},
      userStats: {},
    });
    // Then sign out and redirect
    await signOut();
    router.push('/');
  };

  return (
    <div>
      <div className="flex flex-col items-center w-full">
        <h2>{userData.authData.name}</h2>
        <div className="imageContainer mt-4 w-[80px] h-[80px] shadow-lg relative overflow-hidden object-cover rounded-lg">
          {userData?.authData.image ? (
            <Image
              src={userData.authData.image}
              alt="User Image"
              width={100}
              height={100}
            />
          ) : (
            <Loader />
          )}
        </div>
        {/* <p>Welcome {userData.authData.name}!</p> */}
        <p>Your level: {userData.userStats.level}</p>
        <Button className="mt-10" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
