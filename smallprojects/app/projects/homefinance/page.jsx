'use client';
import Header from '@/app/components/Header/header';

export default function HomeFinance() {
  return (
    <div>
      <Header />
      <div className="flex flex-col items-center w-full">
        <h2>Home Finance</h2>
        <p>Coming soon</p>
        <p>
          Home finance is a project that helps you manage
          your home finances.
        </p>
        <p>
          It will help you keep track of your expenses and
          income.
        </p>
        <p>It will also help you plan your budget.</p>
      </div>
    </div>
  );
}
