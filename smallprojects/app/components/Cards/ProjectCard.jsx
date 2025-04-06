'use client';

import Image from 'next/image';
import React from 'react';

export default function ProjectCard({
  title,
  img,
  description,
  link,
}) {
  return (
    <div className="card flex flex-col w-72 h-60 p-4 border border-border rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold mb-2">
        {title}
      </h3>
      <Image
        src={img}
        alt={title}
        width={100}
        height={100}
      />
      <p className="mb-4">{description}</p>{' '}
      {link ? (
        <a
          href={link}
          className="text-blue-500 hover:underline"
        >
          View project
        </a>
      ) : (
        <p>Coming soon</p>
      )}
    </div>
  );
}
