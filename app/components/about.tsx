// components/AboutMe.js

import React from "react";
import Image from "next/image";
import profilePic from "../../Images/Mfalme.jpg"; // Update the path to your profile picture

export default function AboutMe() {
  return (
    <section id="about-me" className="w-full p-8 bg-gray-100 dark:bg-stone-900">
      <div className="container mx-auto flex flex-col lg:flex-row items-center text-center lg:text-left">
        {/* Profile Picture */}
        <div className="mb-6 lg:mb-0 lg:pr-8 lg:w-1/3 flex-shrink-0">
          <Image
            src={profilePic}
            alt="Profile Picture"
            width={150}
            height={150}
            className="rounded-full border-4 border-gray-300 dark:border-gray-700"
          />
        </div>

        {/* About Me Text */}
        <div className="lg:w-2/3">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            About Me
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Hi, I`m Joseph Gitau, a passionate software developer with experience in building modern web and mobile applications. I love exploring new technologies and solving challenging problems. My goal is to create impactful solutions that improve people`s lives.
          </p>

          {/* Key Skills */}
          <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Key Skills
            </h2>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
              <li className="mb-2">C#, C++, Python, Kotlin,JavaScript & TypeScript </li>
              <li className="mb-2">Nextjs, Reactjs, Vuejs</li>
              <li className="mb-2">Tailwind CSS & Styled Components</li>
              <li className="mb-2">Node.js & Express</li>
              <li className="mb-2">Database Management (SQL & NoSQL)</li>
              <li className="mb-2">Proxmox, Docker </li>
              <li className="mb-2">APIs & Web Services</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
