'use client';

import Image from 'next/image';
import React from 'react';

export default function ProjectCard({
  title,
  img,
  description,
}) {
  return (
    <div className="card flex flex-col items-center w-72 h-72 p-4 border border-border rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>
      <div className="flex w-[120px] h-[120px] justify-center items-center">
        <Image
          className="rounded-lg "
          src={img}
          alt={title}
          width={120}
          height={120}
        />
      </div>
      <p className="mt-6 overflow-y-auto custom-scrollbar border-b-[1px] border-slate-500">
        {description}
      </p>
    </div>
  );
}
