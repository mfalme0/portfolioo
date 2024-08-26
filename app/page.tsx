"use client"; // Add this line at the very top

import { useState, useEffect } from "react";
import Footer from "./components/Footer"
import Image from "next/image";
import project1 from "../Images/better.jpeg";
import project2 from "../Images/OC.jpeg";
import project3 from "../Images/ndai.jpeg";
import project4 from "../Images/archie.jpeg";
import profile from "../Images/Mfalme.jpg";
import ProgrammingLanguages from "./components/Languages";
import { Rejection } from "./components/Recjection";
import { WorkExperience } from "./components/Mboka";
import { ProjectsCarousel } from "./components/Projects";
import { Hero } from "./components/hero";
import { Header } from "./components/header";

export default function Home() {
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setLocalTime(new Date().toLocaleTimeString());
    };

    updateTime(); // Set the initial time
    const intervalId = setInterval(updateTime, 1000); // Update time every second

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  return (

    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-50 dark:bg-gray-900">
      {/* Local Time Display */}
      <Header/> 

      <div className="w-full max-w-5xl flex flex-col items-center text-center mb-4" id="hero">
        {localTime && (
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Local Time: {localTime}
          </p>
        )}
      </div>

      {/* Header */}
      <header className="w-full max-w-5xl flex flex-col items-center text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 ">Joseph Gitau</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Software Engineer | Gamer | Nerd</p>
      </header>


      {/* Hero Section */}
      <section className="relative flex flex-col items-center text-center mb-16">
        <Image
          src={profile}
          alt="Your Profile Picture"
          className="rounded-full grayscale blur hover:blur-0 hover:saturate-100 hover:grayscale-0 hover:scale-110 transition-transform duration-200"
          width={150}
          height={150}
          priority
        />
        <p className="mt-6 text-xl text-gray-700 dark:text-gray-200 max-w-2xl">
          I am a mid developer who will absolutely destroy you in <strong className="text-glitch">Counter-Strike</strong>  or any other shooter and am an avid <strong className="text-glitch-duration-slow">anime </strong>anime enjoyer.
        </p>
      </section>

    <section id="experience">
       <WorkExperience/>
    </section>
 
      
      {/* Projects Section */}
      <section className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 snap-center" id="projects">
        <div className="group rounded-lg border border-gray-300 bg-white dark:bg-gray-800 transition-shadow hover:shadow-lg grayscale blur hover:grayscale-0 hover:scale-110 duration-200 hover:blur-0 ">
          <Image
            src={project1}
            alt="Project 1"
            width={500}
            height={300}
            className="rounded-t-lg"
          />
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Better Farm </h2>
            <p className="text-gray-600 dark:text-gray-300">This is a farming AI assistant with an inbuilt chat bot</p>
          </div>
        </div>
        <div className="group rounded-lg border border-gray-300 bg-white dark:bg-gray-800 transition-shadow hover:shadow-lg grayscale blur hover:grayscale-0 hover:scale-110 hover:blur-0">
          <Image
            src={project2}
            alt="Project 2"
            width={500}
            height={300}
            className="rounded-t-lg"
          />
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">PerfSuite</h2>
            <p className="text-gray-600 dark:text-gray-300"> An all inclusive overclocking software</p>
          </div>
        </div>

        <div className="group rounded-lg border border-gray-300 bg-white dark:bg-gray-800 transition-shadow hover:shadow-lg grayscale blur hover:grayscale-0 hover:scale-110 hover:blur-0">
          <Image
            src={project3}
            alt="Ndai"
            width={500}
            height={300}
            className="rounded-t-lg"
          />
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Ndai</h2>
            <p className="text-gray-600 dark:text-gray-300"> A vehicle management system </p>
          </div>
        </div>

        <div className="group rounded-lg border border-gray-300 bg-white dark:bg-gray-800 transition-shadow hover:shadow-lg grayscale blur hover:grayscale-0 hover:scale-110 hover:blur-0">
          <Image
            src={project4}
            alt="Project 4"
            width={500}
            height={300}
            className="rounded-t-lg"
          />
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-100">Archie</h2>
            <p className="text-gray-600 dark:text-gray-300">A file archival and retival system.</p>
          </div>
        </div>
        {/* Add more projects as needed */}
      </section>
      <Rejection/>
      <ProgrammingLanguages/>


    

    <section id="contact">
      <Footer />
    </section>
      
    </main>
  );
}
 