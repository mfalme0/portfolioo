import Image from 'next/image';
import React from 'react';
import project1 from "../../Images/better.jpeg";
import project2 from "../../Images/OC.jpeg";
import project3 from "../../Images/ndai.jpeg";
import project4 from "../../Images/archie.jpeg";

const projects = [
  {
    title: 'Better Farm',
    description: 'This is a farming AI assistant with an inbuilt chat bot.',
    image: project1,
    alt: 'Project 1',
    link :''
  },
  {
    title: 'PerfSuite',
    description: 'An all-inclusive overclocking software.',
    image: project2,
    alt: 'Project 2',
    link :''
  },
  {
    title: 'Ndai',
    description: 'A vehicle management system.',
    image: project3,
    alt: 'Project 3',
    link :''
  },
  {
    title: 'Archie',
    description: 'A file archival and retrieval system.',
    image: project4,
    alt: 'Project 4',
    link :''
  },
];

export function Projects() {
  return (
    <section className="bg-slate-50 dark:bg-gray-900 p-8">
      <div className="container mx-auto px-8">
        <h1 className="text-3xl font-bold mb-10 text-center text-gray-700 dark:text-gray-200">
          My Projects
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 max-w-xs w-full"
            >
              <Image
                src={project.image}
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {project.title}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
