
import project1 from "../../Images/better.jpeg";
import project2 from "../../Images/OC.jpeg";
import project3 from "../../Images/ndai.jpeg";
import project4 from "../../Images/archie.jpeg";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const projects = [
  {
    title: 'Better Farm',
    description: 'This is a farming AI assistant with an inbuilt chat bot.',
    image: project1,
    alt: 'Project 1',
  },
  {
    title: 'PerfSuite',
    description: 'An all-inclusive overclocking software.',
    image: project2,
    alt: 'Project 2',
  },
  {
    title: 'Ndai',
    description: 'A vehicle management system.',
    image: project3,
    alt: 'Project 3',
  },
  {
    title: 'Archie',
    description: 'A file archival and retrieval system.',
    image: project4,
    alt: 'Project 4',
  },
];

export function ProjectsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
    }, 14000); // Change project every 14 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full mb-16">
      <div className="relative w-full h-[60vh] lg:h-[70vh] xl:h-[80vh] bg-gradient-to-r from-cyan-500 to-blue-500 justify-center">
        <h1>A showcase of projects</h1>
        <Image
          src={projects[currentIndex].image}
          alt={projects[currentIndex].alt}
          layout="fill"
          objectFit="cover"
          className="rounded-lg grayscale on hover:grayscale-0"
        />
      </div>
      <div className="p-6 text-center">
        <h2 className="text-3xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          {projects[currentIndex].title}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          {projects[currentIndex].description}
        </p>
      </div>
    </section>
  );
}
