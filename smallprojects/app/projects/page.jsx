// /app/projects/page.js
'use client';
import ProjectCard from '../components/Cards/ProjectCard';
import Header from '../components/Header/header';
import { useDataContext } from '../context/dataContext';
// import { Flowchart, Node, Edge } from "../components/ui/flowchart";

export default function Projects() {
  const { projectData } = useDataContext();

  return (
    <div>
      <Header />

      <h2>Projects page</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {projectData.map((project, index) => (
          <ProjectCard
            key={index}
            title={project.title}
            img={project.img}
            description={project.description}
            link={project.link}
          />
        ))}
      </div>
    </div>
  );
}
