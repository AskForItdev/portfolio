'use client';

import Image from 'next/image';
import React from 'react';

export default function ProjectCard({
  title,
  img,
  description,
}) {
  return (
    <div
      className="card flex flex-col justify-top
      items-center w-72 h-72 p-4 border border-border
      rounded-lg shadow-md transition-transform hover:scale-[102%]
      hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-2 text-center">
          {title}
        </h3>
        <div className="relative w-[120px] h-[120px]">
          <Image
            className="rounded-lg object-contain"
            src={img}
            alt={title}
            fill
            sizes="120px"
          />
        </div>
      </div>
      <p className="mt-4 overflow-y-auto max-h-20 custom-scrollbar text-sm text-center border-b-[1px] border-slate-500">
        {description}
      </p>
    </div>
  );
}
