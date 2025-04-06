'use client';
import Header from '../components/Header/header';
import { useUserContext } from '../context/userContext';

export default function Home() {
  const { userData } = useUserContext();

  return (
    <div>
      <Header />
      <div className="flex flex-col px-6 sm:px-20 items-center w-full">
        <h2 className="text-2xl mt-8 mb-4">
          Welcome to my show-page,{' '}
          {userData.personalData.name}.
        </h2>

        <p className="mb-4 text-lg">
          This is some kind of portfolio page were i have
          taken suggestions from people in my life regarding
          what to make. I had a hard time feeling drive to
          make things that I just came up with for myself
          cause the ideas may align with my skill level and
          knowledge before what would be fun to see on a
          page.
        </p>
        <p className="mb-4 text-lg">
          So i asked people that knew nothing about
          programming, what they want to see for a web-page
          without them considering my skill-level or what i
          would potentially benifit from. This means that i
          did not limit myself to my understanding of
          programming and i could get a sense that i was
          making somethign actually useful
        </p>
        <p className="mb-4 text-lg">
          So i asked people that knew nothing about
          programming, what they want to see for a web-page
          without them considering my skill-level or what i
          would potentially benifit from. This means that
          what i had to do was to figure out
        </p>
      </div>
    </div>
  );
}
