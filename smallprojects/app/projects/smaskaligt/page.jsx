'use client';
import Image from 'next/image';
import React from 'react';
export default function Smaskaligt() {
  return (
    <div id="smaskaligt" className="h-screen -z-10">
      <div className="flex flex-col items-center bg-[var(--background)] h-auto">
        <div className="flex flex-col items-center w-full">
          <Image
            src="/images/logos/småskaligt.png"
            alt="logo"
            width="300"
            height="300"
          ></Image>
          <div className="border-2 p-2 w-[95%] border-[var(--border)]">
            <ul className="flex justify-between">
              <li>Kategori</li>
              <li>Kategori</li>
              <li>Kategori</li>
              <li>Kategori</li>
              <li>Kategori</li>
              <li>Kategori</li>
              <li>Kategori</li>
              <li>Kategori</li>
              <li>Kategori</li>
            </ul>
          </div>
          <div className="w-[95%] px-10 py-4">
            Lorem ipsum dolor sit amet consectetur
            adipisicing elit. Alias facilis tempore, officia
            explicabo debitis beatae. Quae perferendis
            aliquam exercitationem, cum eos illo fugit
            architecto sit repudiandae omnis aperiam facilis
            explicabo, doloremque culpa fuga facere quam
            aspernatur animi. Laborum obcaecati ex
            praesentium, perferendis amet vel atque quaerat
            blanditiis quos qui voluptas voluptate animi
            quasi quod dolores ipsa ut enim nesciunt. Nisi
            qui nesciunt exercitationem cum, aspernatur
            deserunt quasi cupiditate tenetur itaque odit,
            architecto quidem! Commodi fugiat dolore nemo
            quos soluta temporibus maiores iste enim dolorum
            rerum incidunt ea eius fugit illum molestias
            consequatur perspiciatis dolorem a, accusamus
            numquam saepe minus. Atque.
          </div>
        </div>
        <div className="bg-[var(--background2)] h-max w-full">
          <div className="flex justify-evenly m-2 p-2 border h-auto w-full">
            <div className="border h-200 w-full">
              user Cards
            </div>
            <div className="border h-72 w-full">
              Filters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
