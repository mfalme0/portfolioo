// WorkExperience.jsx
import React, { useState } from 'react';
import { BsCodeSlash } from "react-icons/bs";
import { PiNetwork } from "react-icons/pi";
import { MdHowToVote } from "react-icons/md";
import { GrCloudComputer } from "react-icons/gr";
import { getColorClasses } from './colorUtils'; // Import the external utility

const experiences = [
  {
    company: 'SteadFast Academy',
    role: 'Software Engineer',
    duration: 'April 2025 - Present',
    description: 'I manage the network and cyber security infrastructure of the institution as well as setup any new devices as a service to the community.',
    icon: <GrCloudComputer />,
    color: 'blue'
  },
  {
    company: 'Gituamba Girls Secondary School',
    role: 'Volunteer IT Consultant',
    duration: 'Sep 2024 - Present',
    description: 'I manage the network and cyber security infrastructure of the institution as well as setup any new devices as a service to the community.',
    icon: <GrCloudComputer />,
    color: 'indigo'
  },
  {
    company: 'VisionFund Kenya',
    role: 'Software Engineer Intern',
    duration: 'Oct 2023 - Dec 2023',
    description: 'I was tasked with creating and maintenance of internal tools for various departments within the organization and learnt about various frameworks and cloud services.',
    icon: <BsCodeSlash />,
    color: 'purple'
  },
  {
    company: 'Independent Electoral and Boundaries Commission',
    role: 'Clerk',
    duration: 'Aug 2023',
    description: 'I coordinated the process of voter lookup from the KIEMS kit and details confirmation translating in 100 percent accurate retrieval for the polling station that I was assigned.',
    icon: <MdHowToVote />,
    color: 'green'
  },
  {
    company: 'Tangible Air Solutions',
    role: 'Network Associate',
    duration: 'Apr 2021 - Aug 2021',
    description: 'I worked as technical support and as a network associate until my enrollment into the university.',
    icon: <PiNetwork />,
    color: 'red'
  },
];

export function WorkExperience() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-12 text-center text-gray-800 dark:text-gray-200">Experience</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience, index) => {
            const isHovered = hoveredCard === index;
            const colorClasses = getColorClasses(experience.color, isHovered); // Using the imported function
            
            return (
              <div 
                key={experience.company}
                className={`${colorClasses.bg} rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isHovered ? 'transform scale-105' : ''}`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="p-6">
                  <div className={`flex items-center justify-center w-12 h-12 ${colorClasses.icon} rounded-full mb-6 mx-auto transition-colors duration-300`}>
                    {experience.icon}
                  </div>
                  
                  <h2 className={`text-xl font-medium text-center ${colorClasses.title} mb-2 transition-colors duration-300`}>
                    {experience.company}
                  </h2>
                  <p className="text-base font-medium text-center text-gray-500 dark:text-gray-400 mb-3">
                    {experience.role}
                  </p>
                  <p className="text-sm text-center text-gray-400 mb-4">
                    {experience.duration}
                  </p>
                  
                  <div className={`h-px ${colorClasses.border} my-4 transition-colors duration-300`}></div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {experience.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}