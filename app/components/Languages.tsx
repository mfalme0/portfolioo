import React, { useState } from 'react';
import { FaJava, FaPython, FaJs, FaReact, FaNodeJs, FaHtml5, FaCss3Alt } from 'react-icons/fa';
import { SiCsharp, SiFlutter, SiKotlin, SiNextdotjs, SiCplusplus } from 'react-icons/si';
import { FaVuejs } from 'react-icons/fa';
import { getColorClasses } from './colorUtils'; // Import the external utility

const languages = [
  { name: 'Java', icon: <FaJava />, proficiency: 'Intermediate', color: 'orange' },
  { name: 'Python', icon: <FaPython />, proficiency: 'Intermediate', color: 'blue' },
  { name: 'JavaScript', icon: <FaJs />, proficiency: 'Advanced', color: 'yellow' },
  { name: 'React', icon: <FaReact />, proficiency: 'Advanced', color: 'blue' },
  { name: 'Node.js', icon: <FaNodeJs />, proficiency: 'Advanced', color: 'green' },
  { name: 'HTML5', icon: <FaHtml5 />, proficiency: 'Advanced', color: 'orange' },
  { name: 'CSS3', icon: <FaCss3Alt />, proficiency: 'Advanced', color: 'blue' },
  { name: 'C#', icon: <SiCsharp />, proficiency: 'Advanced', color: 'purple' },
  { name: 'Flutter', icon: <SiFlutter />, proficiency: 'Advanced', color: 'blue' },
  { name: 'Kotlin', icon: <SiKotlin />, proficiency: 'Advanced', color: 'orange' },
  { name: 'NextJS', icon: <SiNextdotjs />, proficiency: 'Advanced', color: 'gray' },
  { name: 'C++', icon: <SiCplusplus />, proficiency: 'Advanced', color: 'blue' },
  { name: 'VueJS', icon: <FaVuejs />, proficiency: 'Intermidiate', color: 'green' },
];

export default function ProgrammingLanguages() {
   const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-12 text-center text-gray-800 dark:text-gray-200">
          Languages I am familiar with
        </h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
          {languages.map((lang, index) => {
            const isHovered = hoveredCard === index;
            const colorClasses = getColorClasses(lang.color, isHovered);
            
            return (
              <div 
                key={lang.name}
                className={`${colorClasses.bg} rounded-xl border ${colorClasses.border} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isHovered ? 'transform scale-105' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="p-4">
                  <div className={`flex justify-center items-center h-16 mb-3 text-4xl ${colorClasses.icon} transition-colors duration-300`}>
                    {lang.icon}
                  </div>
                  
                  <h2 className={`text-base font-medium text-center ${colorClasses.title} mb-3`}>
                    {lang.name}
                  </h2>
                  
                  <div className={`text-xs font-medium text-center py-1 px-2 rounded-full ${colorClasses.proficiency}`}>
                    {lang.proficiency}
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