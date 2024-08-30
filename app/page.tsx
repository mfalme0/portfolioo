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
import { Projects } from "./components/Projects";
import { Hero } from "./components/hero";
import { Header } from "./components/header";
import { Games } from "./components/games";
import Techstack from "./components/Techstack";

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

    <main className="flex min-h-screen flex-col items-center justify-between  bg-gray-50 dark:bg-gray-900">
      {/* Local Time Display */}
      <Header/>
      <section className="w-full" id="hero">
          <Hero/>
      </section>

      <section id="experience">
       <WorkExperience/>
    </section>
    <section id="projects">
        <Projects/>
    </section>
   

    
      
      {/* Projects Section */}

      
      <section id="techstack" className="p-24">
        <Techstack/>
        <ProgrammingLanguages/>
      </section>
      


    

    <section id="contact">
      <Footer />
    </section>
      
    </main>
  );
}
 