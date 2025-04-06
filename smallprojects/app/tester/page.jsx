'use client';
import { useRef, useState } from 'react';

import LoadButton from '../components/Buttons/LoadButton';
import ProjectCard from '../components/Cards/ProjectCard';
import Header from '../components/Header/header';
import { useDataContext } from '../context/dataContext';

export default function ElementTester() {
  const { projectData } = useDataContext();
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const handleClick = () => {
    console.log('Button clicked!');
    startLoading();
  };

  const startLoading = () => {
    console.log('Loading started!');
    if (loading) {
      clearTimeout(timeoutRef.current);
      setLoading(false);
    } else {
      setLoading(true);
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  };
  return (
    <div>
      <Header />
      <h2>On this page i just test some components</h2>
      <div className="component-container mt-20 flex flex-col items-center w-full">
        <h3>
          A button that loads while &quot;loading&quot;
          usestate is &quot;true&quot;. (5 sec for testing)
        </h3>
        <div className="load-button-container border-2 border-border rounded-lg p-4 m-2">
          <LoadButton
            text="test"
            onClick={handleClick}
            loading={loading}
          />
        </div>
        <h3 className="mt-10 text-center">
          This is a project card that uses data from the
          dataContext (using only the first for this
          example)
        </h3>
        <div className="border-2 border-border rounded-lg p-10 mt-4">
          <div className="card-container">
            <ProjectCard
              title={projectData[0].title}
              img={projectData[0].img}
              description={projectData[0].description}
              link={projectData[0].link}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
