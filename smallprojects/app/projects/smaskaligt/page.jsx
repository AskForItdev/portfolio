'use client';
import Image from 'next/image';
import { React, useEffect, useState } from 'react';

import CreatorCard from '@/app/components/Cards/CreatorCard';
import {
  mockCategories,
  mockCreators,
} from '@/app/components/Cards/mockdata';
// import publicSupabaseClient from '@/db/publicDb';
import { getFilterOptions } from '@/db/publicDb';
export default function Smaskaligt() {
  const [dropDownCategory, setDropDownCategory] = useState(
    []
  );
  const [dropDownStyle, setDropDownStyle] = useState([]);
  const [dropDownMaterials, setDropDownMaterial] = useState(
    []
  );
  const [checksFeatures, setChecksFeatures] = useState([]);
  // MARK: Categories
  useEffect(() => {
    async function getFiltersCat() {
      const { data, error } = await getFilterOptions(
        'smsk_categories'
      );
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      if (!data || data.length === 0) {
        console.warn('No categories found');
        return;
      }
      setDropDownCategory(data);
      console.log('Fetched categories:', data);
    }

    getFiltersCat();
  }, []);
  // MARK: Styles
  useEffect(() => {
    async function getFiltersStyle() {
      const { data, error } =
        await getFilterOptions('smsk_styles');
      if (error) {
        console.error('Error fetching styles:', error);
        return;
      }
      if (!data || data.length === 0) {
        console.warn('No styles found');
        return;
      }

      setDropDownStyle(data);
      console.log('Fetched Styles:', data);
    }
    getFiltersStyle();
  }, []);
  // MARK: Materials
  useEffect(() => {
    async function getFiltersMats() {
      const { data, error } = await getFilterOptions(
        'smsk_materials'
      );
      if (error) {
        console.error('Error fetching materials:', error);
        return;
      }
      if (!data || data.length === 0) {
        console.warn('No materials found');
      }
      setDropDownMaterial(data);
      console.log('Fetched materials:', data);
    }
    getFiltersMats();
  }, []);
  // MARK: Features
  useEffect(() => {
    async function getFiltersFeatures() {
      const { data, error } =
        await getFilterOptions('smsk_features');
      if (error) {
        console.error('Error fetching Features:', error);
        return;
      }
      if (!data || data.length === 0) {
        console.warn('No mFeatures found');
      }
      setChecksFeatures(data);
      console.log('Fetched Features:', data);
    }
    getFiltersFeatures();
  }, []);

  return (
    <>
      <div
        id="smaskaligt"
        className="font-avenir h-screen z-9"
      >
        <div className="flex flex-col items-center bg-[var(--background)] h-auto ">
          <div className="flex flex-col items-center w-full">
            <Image
              className="rounded-[50%] m-2"
              src="/images/skaperian/smaskaligt1.jpeg"
              alt="logo"
              width="150"
              height="150"
            ></Image>
            <div className="flex flex-col items-center w-full">
              <div className="flex justify-center p-4 bg-white w-full">
                <ul
                  className="flex flex-wrap justify-evenly
               w-[80rem] xl:flex-nowrap"
                >
                  {mockCategories.map((category, index) => (
                    <li
                      key={index}
                      className="w-fit xl:w-full mx-[0.1rem] bg-[var(--background2)] rounded-full text-center text-sm font-semibold py-1 px-2 hover:bg-gray-200 cursor-pointer"
                      onClick={() => {
                        console.log(
                          `Selected category: ${category}`
                        );
                      }}
                    >
                      {category}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center w-full">
            <div className="overflow-y-auto flex justify-center bg-[var(--background2)] h-max w-full">
              <div className="flex gap-6 justify-evenly m-6 pt-2 h-auto w-[80rem]">
                <div className="flex-1 px-2">
                  <div className="creatorCardContainer flex flex-wrap gap-[.75rem]">
                    {mockCreators.map((creator, index) => (
                      <CreatorCard
                        key={index}
                        name={creator.displayName}
                        fullName={creator.fullName}
                        city={creator.city}
                        mainCategory={creator.mainCategory}
                        imageUrls={creator.imageUrls}
                        styles={creator.styles.join(', ')}
                        features={creator.features}
                      />
                    ))}
                  </div>
                </div>
                <div className="p-2 w-full rounded-2xl flex flex-col basis-[23%] bg-[var(--card)]">
                  <div className="p-4 flex flex-col gap-4 text-sm">
                    <h2 className="font-bold text-base">
                      FILTER
                    </h2>

                    {/* Dropdowns */}

                    {dropDownCategory && (
                      <select
                        className="bg-[var(--background2)] p-2 rounded-full"
                        name=""
                        defaultValue=""
                        id=""
                      >
                        <option value="" disabled hidden>
                          KATEGORI
                        </option>
                        {dropDownCategory.map((item) => (
                          <option
                            key={item.id}
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {dropDownStyle && (
                      <select
                        className="bg-[var(--background2)] p-2 rounded-full"
                        name=""
                        defaultValue=""
                        id=""
                      >
                        <option value="" disabled hidden>
                          STIL
                        </option>
                        {dropDownStyle.map((item) => (
                          <option
                            key={item.id}
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {dropDownMaterials && (
                      <select
                        className="bg-[var(--background2)] p-2 rounded-full"
                        name=""
                        defaultValue=""
                        id=""
                      >
                        <option value="" disabled hidden>
                          MATERIAL
                        </option>
                        {dropDownMaterials.map((item) => (
                          <option
                            key={item.id}
                            value={item.name}
                          >
                            {item.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {/* Prisintervall */}
                    <div className="flex flex-col">
                      <label className="font-semibold">
                        PRISINTERVALL
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="5000"
                        className="w-full mt-2"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span>10:-</span>
                        <span>5000:-</span>
                      </div>
                      {/* Checkboxar */}
                      <div className="flex flex-col gap-1 mt-4">
                        <label className="font-semibold mb-1">
                          ERBJUDER
                        </label>

                        {checksFeatures.map(
                          (label, index) => (
                            <label
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <input type="checkbox" />
                              {label.name}
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
