'use client';
import Image from 'next/image';
import Link from 'next/link';

import { useDataContext } from '../../context/dataContext';
import { useUserContext } from '../../context/userContext';

export default function Header() {
  const { userData } = useUserContext();
  const { headerLinks } = useDataContext();

  return (
    <div className="flex flex-col">
      <h1 className="p-3 mb-2 mb-6 sm:mb-0 bg-[var(--card)]">
        Header
      </h1>
      <ul className="flex flex-row justify-between rounded-b-md">
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
        <li className="border text-center w-24 rounded-b-md p-2 hidden sm:block shadow-md"></li>
      </ul>
      <div>
        <Link
          href="/profile"
          className="absolute top-2 right-2"
        >
          <Image
            className="w-[80px] h-[80px] shadow-lg relative overflow-hidden object-cover rounded-lg"
            src="/images/BK fan-art.webp"
            alt={userData.personalData.image}
            width={100}
            height={100}
          />
        </Link>
      </div>
    </div>
  );
}
