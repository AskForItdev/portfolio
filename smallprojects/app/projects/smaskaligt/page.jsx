'use client';
import Image from 'next/image';
import React from 'react';
export default function Smaskaligt() {
  return (
    <div id="smaskaligt" className="bg-white h-screen">
      <div className="bg-[var(--background)] h-auto">
        <Image
          src="/images/logos/småskaligt.png"
          alt="logo"
          width="300"
          height="300"
        ></Image>
        <h2>Nothing to see here!</h2>
        Background
      </div>
      <div className="bg-[var(--background2)] h-full">
        Background 2
        <div>
          <button>Test</button>
        </div>
      </div>
      <div>foreground</div>
    </div>
  );
}
