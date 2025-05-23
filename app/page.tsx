"use client"; // Add this line at the very top

import { useState, useEffect } from "react";
import Footer from "./components/Footer";
import { Rejection } from "./components/Recjection";
import { WorkExperience } from "./components/Mboka";
import { Projects } from "./components/Projects";
import { Hero } from "./components/hero";
import { Header } from "./components/header";
import { Games } from "./components/games";
import Techstack from "./components/Techstack";
import ProgrammingLanguages from "./components/Languages";
import Github from "./components/github";
import AboutMe from "./components/about";
import Preloader from "./components/preloader";
import { FaArrowAltCircleUp } from "react-icons/fa";
import AuraSyncComponent from "./components/aura";
import { CiCircleChevUp } from "react-icons/ci";

export default function Home() {
  const [localTime, setLocalTime] = useState("");
  const [showArrow, setShowArrow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      setLocalTime(new Date().toLocaleTimeString());
    };

    updateTime(); // Set the initial time
    const intervalId = setInterval(updateTime, 1000); 

    return () => clearInterval(intervalId); // Clean up on component unmount
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("hero");
      const scrollPosition = window.scrollY;
      if (heroSection && scrollPosition > heroSection.offsetHeight) {
        setShowArrow(true);
      } else {
        setShowArrow(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToHero = () => {
    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
  };

  // Simulate loading time
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000); 
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <Preloader />;
  }

  return (
    <main className="flex min-h-screen max-w-full w-screen flex-col items-center justify-between bg-gray-50 dark:bg-gray-900 custom-scrollbar overflow-x-hidden">
    
      <Header />

      <section className="w-full max-w-screen overflow-x-hidden" id="hero">
        <Hero />
      </section>

      <section className="w-full max-w-screen overflow-x-hidden" id="about">
        <AboutMe />
      </section>

      <section className="w-full max-w-screen overflow-x-hidden" id="experience">
        <WorkExperience />
      </section>
      
      <section className="max-w-screen overflow-x-hidden" id="projects">
        <Projects />
      </section>
  
      <section className=" max-w-screen overflow-x-hidden p-24" id="techstack">
        <Techstack />
        <ProgrammingLanguages />
      </section>

      {/* GitHub Section with Horizontal Scroll */}
      <section className=" max-w-screen overflow-x-auto" id="github">
        <div className="min-w-[1200px]"> {/* Adjust the min-width as needed */}
          <Github />  
        </div>
      </section>
   
      <section className="w-full max-w-screen overflow-x-hidden" id="contact">
        <Footer />
      </section>

      {/* Arrow to scroll back to Hero */}
      {showArrow && (
        <div
          onClick={scrollToHero}
          className="fixed bottom-4 right-4 cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-blue-500 transition-colors duration-300"
        >
          <CiCircleChevUp size={40} />
        </div>
      )}
    </main>
  );
}
