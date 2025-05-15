// /app/projects/page.js
'use client';
import Link from 'next/link';

import ProjectCard from '../components/Cards/ProjectCard';
import { useDataContext } from '../context/dataContext';
// import { Flowchart, Node, Edge } from "../components/ui/flowchart";

export default function Projects() {
  const { projectData } = useDataContext();

  return (
    <div>
      <h2>Projects page</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {projectData.map((project, index) => (
          <Link
            key={index}
            href={project.link}
            className=""
          >
            <ProjectCard
              title={project.title}
              img={project.img}
              description={project.description}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
