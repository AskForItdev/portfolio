import Image from 'next/image';
import { React, useEffect, useRef } from 'react';

import ClickIcons from '../clickIcons';
export default function CreatorCard({
  name,
  fullName,
  city,
  mainCategory,
  styles,
  imageUrls,
  features,
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const start = (e) => {
      e.preventDefault();
      isDown = true;
      el.classList.add('cursor-grabbing');
      startX = e.pageX || e.touches[0].pageX;
      scrollLeft = el.scrollLeft;
    };

    const end = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    };

    const move = (e) => {
      if (!isDown) return;
      const x = e.pageX || e.touches[0].pageX;
      const walk = (x - startX) * 1.2;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchend', end);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, {
      passive: false,
    });

    el.addEventListener('dragstart', (e) =>
      e.preventDefault()
    );

    return () => {
      el.removeEventListener('mousedown', start);
      el.removeEventListener('touchstart', start);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchend', end);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
    };
  }, []);

  return (
    <div
      className={
        'bg-[var(--card)] flex flex-col w-full xl:w-[49%] rounded-2xl shadow-md transition-transform hover:scale-[102%] hover:shadow-lg transition-shadow duration-300 p-[0.7rem]'
      }
    >
      <div>
        <div className="flex justify-between items-start">
          <div className="text-1 text-xl font-semibold">
            {name}
          </div>
          <ClickIcons icon="heart" />
        </div>
        <div className="flex flex-row">
          <div
            id="CreatorCardSection1"
            className="flex flex-col gap-2 w-[50%]"
          >
            <div>
              <p className="text-sm">{fullName}</p>
              <p className="text-sm">{city}</p>
              <p className="text-sm">{mainCategory}</p>
            </div>
            <div
              ref={scrollRef}
              className="overflow-x-auto scrollbar-hide cursor-grab select-none"
            >
              <div className="flex gap-2 flex-nowrap scroll-smooth ">
                {imageUrls.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-[90px] h-[90px] shrink-0 overflow-hidden rounded-xl"
                  >
                    <Image
                      fill
                      src={url}
                      alt=""
                      sizes="90px"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            id="CreatorCardSection"
            className="flex flex-col w-[50%] items-center"
          >
            <div className="flex flex-col flex-1 mb-2">
              <p>{styles}</p>
              <ul>
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center"
                  >
                    <p className="text-xl mr-2 text-[var(--buttonText2)]">
                      ✔
                    </p>
                    <p className="text-sm leading-none">
                      {feature}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-nowrap gap-2 max-w-[10.5rem]">
              <button className="w-24 h-[1.8rem] rounded-full bg-[var(--button2)] text-black font-semibold text-sm whitespace-nowrap hover:bg-[var(--hoverred)]">
                Kontakta
              </button>
              <button className="w-24 h-[1.8rem] rounded-full bg-[var(--button2)] text-black font-semibold text-sm whitespace-nowrap hover:bg-[var(--hoverred)]">
                Läs mer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
