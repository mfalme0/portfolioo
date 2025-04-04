import Image from 'next/image';
import React from 'react';
import project1 from "../../Images/better.jpeg";
import project2 from "../../Images/OC.jpeg"; // Imported but not used
import project3 from "../../Images/ndai.jpeg";
import project4 from "../../Images/archie.jpeg";

const projects = [
  {
    title: 'Better Farm',
    description: 'This is a farming AI assistant with an inbuilt chat bot.',
    image: project1,
    category: 'app',
    alt: 'Better Farm',
    
    github: 'https://github.com/mfalme0/betterFarm'
  },
  {
    title: 'Ndai',
    description: 'A vehicle management system.',
    image: project3,
    category: 'webapp',
    alt: 'Ndai',
    github: 'https://github.com/mfalme0/ndai.com'
  },
  {
    title: 'Archie',
    description: 'A file archival and retrieval system.',
    image: project4,
    category: 'webapp',
    alt: 'Archie',
    github: 'https://github.com/mfalme0/Archiewebapp'
  },
];

export function Projects() {
  return (
    <section className="bg-slate-50 dark:bg-gray-900 p-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <Image src={project.image} alt={project.alt} className="w-full h-40 object-cover rounded-md" />
            <h3 className="text-lg font-bold mt-3 text-gray-900 dark:text-white">{project.title}</h3>
            <p className="text-gray-700 dark:text-gray-300">{project.description}</p>
            <div className="mt-2 flex gap-3">
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">demo</a>
              )}
              {project.github && (
                <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">GitHub</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
