import React from 'react';
import {  BsCodeSlash } from "react-icons/bs";
import { PiNetwork } from "react-icons/pi";
import { MdHowToVote } from "react-icons/md";
import { GrCloudComputer } from "react-icons/gr";
import { IconBase } from 'react-icons';

const experiences = [
  {
    company: 'Tangible Air Solutions.',
    role: 'Network Associate',
    duration: 'Apr 2021 - Aug 2021',
    description: 'I worked as technical support and as a network associate until my enrollment into the university.',
    icon: <PiNetwork/>,
  },
  {
    company: 'Independent Electoral and Boundaries Commission',
    role: 'Clerk',
    duration: 'Aug 2023',
    description: 'I coordinated the process of voter lookup from the KIEMS kit and details confirmation translating in 100 percent accurate retrieval for the polling station that I was assigned.',
    icon: <MdHowToVote/>,
  },
  {
    company: 'VisionFund Kenya',
    role: 'Software Engineer Inter',
    duration: 'Oct 2023 - Dec 2023',
    description: 'I was tasked with creating and maintenance of internal tools for various departments within the organization and learnt about various frameworks and clouds services',
    icon: <BsCodeSlash />,
  },
  {
    company: 'Gituamba Girls Secondary School',
    role: 'IT Consultant Volunteer',
    duration: 'Sep 2024- Present',
    description: 'I manage the network and cyber security infrasturcture of the institution as well as setup any new devices as a service to the community.',
    icon:  <GrCloudComputer/>,
  }
];

export function WorkExperience() {
  return (
    <div className="bg-slate-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-500">My Work Experience</h1>
      <div className="flex flex-wrap justify-center gap-6">
        {experiences.map((experience) => (
          <div key={experience.company} className="relative bg-gray-700 p-6 rounded-lg shadow-lg max-w-xs w-full group hover:shadow-blue-600 hover:scale-105">
            <div className="flex justify-center mb-4 text-white text-4xl">
              {experience.icon}
            </div>
            <h2 className="text-xl font-semibold text-center text-gray-200">{experience.company}</h2>
            <p className="text-center text-gray-400 mt-1">{experience.role}</p>
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-xl font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
              {experience.duration}
            </div>
            <p className="mt-4 text-gray-400 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {experience.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
