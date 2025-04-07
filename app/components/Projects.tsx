import Image from 'next/image';
import React from 'react';
import project1 from "../../Images/better.jpeg";
import project3 from "../../Images/ndai.jpeg";
import project4 from "../../Images/archie.jpeg";
import ganji from "../../Images/ganji.png"
// Import icons
import { FaMobile, FaLaptopCode, FaDatabase, FaCode } from 'react-icons/fa';

// Function to get the appropriate icon based on category
const getCategoryIcon = (category) => {
  switch(category.toLowerCase()) {
    case 'app':
      return <FaMobile className="text-blue-500" />;
    case 'webapp':
      return <FaLaptopCode className="text-green-500" />;
    case 'database':
      return <FaDatabase className="text-purple-500" />;
    default:
      return <FaCode className="text-gray-500" />;
  }
};

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
  {
    title: 'Ganji',
    description: 'Financial Tracker',
    image: ganji,
    category: 'app',
    alt: 'ganji',    
    github: 'https://github.com/mfalme0/ganji'
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
            <div className="flex items-center gap-2 mt-3">
              {getCategoryIcon(project.category)}
              <span className="text-sm text-gray-500 dark:text-gray-400">{project.category}</span>
            </div>
            <h3 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">{project.title}</h3>
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