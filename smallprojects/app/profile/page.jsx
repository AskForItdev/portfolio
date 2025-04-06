'use client';
import Image from 'next/image';

import Header from '../components/Header/header';
import { useUserContext } from '../context/userContext';

export default function ProfilePage() {
  const { userData } = useUserContext();

  return (
    <div>
      <Header />
      <div className="flex flex-col items-center w-full">
        <h2>{userData.personalData.name}</h2>
        <Image
          className="w-[80px] h-[80px] relative overflow-hidden object-cover rounded-lg"
          src={userData.personalData.image}
          alt="User Image"
          height={100}
          width={100}
        ></Image>
        <p>Welcome2 {userData.personalData.name}!</p>
        <p>Your level: {userData.pageData.Level}</p>
      </div>
    </div>
  );
}
