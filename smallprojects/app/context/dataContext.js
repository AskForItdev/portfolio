'use client';

import { createContext, useContext } from 'react';

const DataContext = createContext();

export const DataContextProvider = ({ children }) => {
  const projectData = [
    {
      title: 'Dennis Idea',
      img: '/images/2.png',
      description: 'This is a brief description.',
      link: 'projects/dennisidea',
    },
    {
      title: 'Real Net Worth',
      img: '/images/amazingbox.jpg',
      description: 'This project does something else.',
      link: 'projects/realnetworth',
    },
    {
      title: 'Sälja ved',
      img: '/images/planet.png',
      description:
        'Detta projektet skall se ut som en tjänst för skogsägare att sälja överkott av ved. Tanken är att användare ska kunna lista olika kategoriera och volymer.',
      link: 'projects/timer',
    },
    {
      title: 'Home Finances',
      img: '/images/spreadCubes.png',
      description: 'This is fourth project.',
      link: 'projects/homefinance',
    },
    {
      title: 'Småskaligt',
      img: '/images/skaperian/småskaligt.png',
      description: 'Project for a creator-databank!',
      link: 'projects/smaskaligt',
    },
  ];

  const headerLinks = [
    { title: 'Home', link: '/home' },
    { title: 'Projects', link: '/projects' },
    { title: 'Profile', link: '/profile' },
    { title: 'ElementTester', link: '/tester' },
  ];

  return (
    <DataContext.Provider
      value={{ projectData, headerLinks }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => useContext(DataContext);
