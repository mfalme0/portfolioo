import Image from 'next/image';
import React, { useState } from 'react';
import project1 from "../../Images/better.jpeg";
import project3 from "../../Images/ndai.jpeg";
import project4 from "../../Images/archie.jpeg";
import ganji from "../../Images/ganji.png";
import { FaMobile, FaLaptopCode, FaDatabase, FaCode } from 'react-icons/fa';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { getColorClasses } from './colorUtils';

const projects = [
  {
    title: 'Better Farm',
    description: 'This is a farming AI assistant with an inbuilt chat bot.',
    image: project1,
    category: 'app',
    alt: 'Better Farm',
    github: 'https://github.com/mfalme0/betterFarm',
    color: 'green',
    link: ''
  },
  {
    title: 'Ganji',
    description: 'Financial Tracker',
    image: ganji,
    category: 'app',
    alt: 'ganji',    
    github: 'https://github.com/mfalme0/ganji',
    color: 'purple',
    link: ''
  },
  {
    title: 'Ndai',
    description: 'A vehicle management system.',
    image: project3,
    category: 'webapp',
    alt: 'Ndai',
    github: 'https://github.com/mfalme0/ndai.com',
    color: 'blue',
    link: ''
  },
  {
    title: 'Archie',
    description: 'A file archival and retrieval system.',
    image: project4,
    category: 'webapp',
    alt: 'Archie',
    github: 'https://github.com/mfalme0/Archiewebapp',
    color: 'indigo',
    link: ''
  },

];


const getCategoryIcon = (category: string) => {
  switch(category.toLowerCase()) {
    case 'app':
      return <FaMobile />;
    case 'webapp':
      return <FaLaptopCode />;
    case 'database':
      return <FaDatabase />;
    default:
      return <FaCode />;
  }
};

export function Projects() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

 

  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-semibold mb-12 text-center text-gray-800 dark:text-gray-200">Projects</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const isHovered = hoveredCard === index;
            const colorClasses = getColorClasses(project.color, isHovered);
            
            return (
              <div 
                key={index} 
                className={`${colorClasses.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isHovered ? 'transform scale-105' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative h-48 overflow-hidden rounded-t-2xl">
                  <Image 
                    src={project.image} 
                    alt={project.alt} 
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
                    style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                  />
                  <div className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent`}>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-6 h-6 ${colorClasses.icon} rounded-full transition-colors duration-300`}>
                        {getCategoryIcon(project.category)}
                      </div>
                      <span className="text-sm text-white">{project.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className={`text-xl font-medium ${colorClasses.title} transition-colors duration-300`}>
                    {project.title}
                  </h3>
                  
                  <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className={`h-px ${colorClasses.border} my-4 transition-colors duration-300`}></div>
                  
                  <div className="flex gap-4">
                    {project.github && (
                      <a 
                        href={project.github} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md ${colorClasses.button} transition-colors duration-300`}
                      >
                        <FiGithub size={16} />
                        <span>GitHub</span>
                      </a>
                    )}
                    {project.link && (
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md ${colorClasses.button} transition-colors duration-300`}
                      >
                        <FiExternalLink size={16} />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}