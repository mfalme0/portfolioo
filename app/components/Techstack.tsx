// TechStack.jsx
import React, { useState } from 'react';
import { SiWindows10, SiWindows11, SiMacos, SiAndroid, SiIos, SiLinux, SiProxmox } from 'react-icons/si';
import { FaAws, FaDocker, FaFigma } from 'react-icons/fa';
import { DiMongodb } from 'react-icons/di';
import { RiFirebaseFill } from 'react-icons/ri';
import { getColorClasses } from './colorUtils'; // Import the external utility

const technologies = [
  { 
    name: 'Windows 10', 
    icon: <SiWindows10 />, 
    proficiency: 'Expert',
    color: 'blue'
  },
  { 
    name: 'Windows 11', 
    icon: <SiWindows11 />, 
    proficiency: 'Expert',
    color: 'indigo'
  },
  { 
    name: 'MacOS', 
    icon: <SiMacos />, 
    proficiency: 'Intermediate',
    color: 'gray'
  },
  { 
    name: 'iOS', 
    icon: <SiIos />, 
    proficiency: 'Expert',
    color: 'purple'
  },
  { 
    name: 'Android', 
    icon: <SiAndroid />, 
    proficiency: 'Advanced',
    color: 'green'
  },
  { 
    name: 'Linux', 
    icon: <SiLinux />, 
    proficiency: 'Advanced',
    color: 'yellow'
  },
  { 
    name: 'AWS', 
    icon: <FaAws />, 
    proficiency: 'Intermediate',
    color: 'orange'
  },
  { 
    name: 'MongoDB', 
    icon: <DiMongodb />, 
    proficiency: 'Intermediate',
    color: 'green'
  },
  { 
    name: 'Firebase', 
    icon: <RiFirebaseFill />, 
    proficiency: 'Advanced',
    color: 'amber'
  },
  {
    name: 'Docker', 
    icon: <FaDocker />, 
    proficiency: "Advanced",
    color: 'blue'
  },
  {
    name: 'Proxmox', 
    icon: <SiProxmox />, 
    proficiency: "Advanced",
    color: 'orange'
  },
  {
    name: 'Figma', 
    icon: <FaFigma />, 
    proficiency: "Advanced",
    color: 'pink'
  },

];

export default function TechStack() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-12 text-center text-gray-800 dark:text-gray-200">Tech Stack</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {technologies.map((tech, index) => {
            const isHovered = hoveredCard === index;
            const colorClasses = getColorClasses(tech.color, isHovered); // Using the imported function
            
            return (
              <div 
                key={tech.name}
                className={`${colorClasses.bg} rounded-xl border ${colorClasses.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isHovered ? 'transform scale-105' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="p-4">
                  <div className={`flex justify-center items-center h-16 mb-3 text-4xl ${colorClasses.icon} transition-colors duration-300`}>
                    {tech.icon}
                  </div>
                  
                  <h2 className={`text-base font-medium text-center ${colorClasses.title} mb-3`}>
                    {tech.name}
                  </h2>
                  
                  <div className={`text-xs font-medium text-center py-1 px-2 rounded-full ${colorClasses.proficiency}`}>
                    {tech.proficiency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}