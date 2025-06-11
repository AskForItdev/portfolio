'use client';

// app/components/Header/header.jsx
import { setCookie } from 'cookies-next';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import Loader from '@/app/components/Loader';
import {
  useDataContext,
  useThemeContext,
  useUserContext,
} from '@/app/context/appProvider';
import { createUserData, getUserData } from '@/db/publicDb';

export default function Header() {
  const { setUserData, userData, checkSession } =
    useUserContext();
  const { headerLinks } = useDataContext();
  const [sessionChecked, setSessionChecked] =
    useState(false);
  const { hideHeader, setHideHeader, headerType } =
    useThemeContext();
  // const [headerType, setHeaderType] = useState('header');

  useEffect(() => {
    (async () => {
      await checkSession();
      setSessionChecked(true);
    })();
  }, [checkSession]);

  const fetchUserData = useCallback(async () => {
    if (!userData.authData.id) return;

    const { data, error } = await getUserData(
      userData.authData.id
    );

    if (error) {
      console.log(error);
      if (error?.code === 'PGRST116') {
        const { data: createData, error: createError } =
          await createUserData(userData.authData.id);
        if (createError) {
          console.log(
            'Failed to create user row',
            createError
          );
          return;
        }
        if (createData) {
          setUserData((prev) => ({
            ...prev,
            authData: {
              ...prev.authData,
              image: createData?.profile_image,
            },
          }));
          userCookie(createData);
        }
      }
    }
    if (!data) {
      console.log('Failed to fetch user data');
      return;
    }
    console.log('User data from database:', data);
    if (data) {
      setUserData((prev) => ({
        ...prev,
        authData: {
          ...prev.authData,
          image: data?.profile_image,
          name: data?.user_name,
        },
      }));
      userCookie(data);
    }
  }, [userData.authData.id, setUserData]);

  function userCookie(data) {
    setCookie('userData', JSON.stringify(data), {
      maxAge: 60 * 60 * 6,
    });
  }

  useEffect(() => {
    if (!sessionChecked) return;
    fetchUserData();
  }, [sessionChecked, fetchUserData]);

  return (
    <div className="flex flex-col">
      {headerType === 'hide' && (
        <div>
          <button
            className="absolute py-0 px-2 bg-transparent"
            onClick={() => setHideHeader((h) => !h)}
          >
            X
          </button>
        </div>
      )}
      {!hideHeader && (
        <div>
          <h1 className="p-3 mb-2 mb-6 sm:mb-0 bg-[var(--card)]">
            Header
          </h1>
          <ul className="flex flex-row justify-between rounded-b-md z-10">
            {headerLinks.map((link, index) => (
              <li
                key={index}
                className="flex-grow basis-0 border text-center rounded-b-md shadow-md-custom hover:shadow-lg-custom transition-shadow duration-300"
              >
                <Link
                  className="block w-full h-full p-2"
                  href={link.link}
                >
                  {link.title}
                </Link>
              </li>
            ))}
            <li className="border text-center w-28 rounded-b-md p-2 hidden sm:block shadow-md"></li>
          </ul>
          <div>
            <Link
              href="/profile"
              className="absolute top-2 right-2"
            >
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
              {userData.name}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
