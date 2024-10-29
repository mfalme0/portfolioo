"use client"; // Add this line at the very top

import { useState, useEffect } from "react";
import Footer from "..//components/Footer";
import { FaArrowAltCircleUp } from "react-icons/fa";
import MyRig from "../components/pc";
import PerformanceSpecs from "../components/pc2";
import { Header } from "../components/gamingheader";
import ModelOComponent from "../components/model";
import Peripherals from "../components/gaminggear";
import { Games } from "../components/games";
import { CiCircleChevUp } from "react-icons/ci";
import Preloader from "../components/gamingloader";
import { FaChevronCircleUp } from "react-icons/fa";

export default function Gear() {
  const [showArrow, setShowArrow] = useState(false);
  const [loading, setLoading] = useState(true);

const scorllTorig = () => {
    document.getElementById("rig")?.scrollIntoView({behavior:"smooth"})

}
useEffect(() => {
  const handleScroll = () => {
    const heroSection = document.getElementById("rig");
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

useEffect(() => {
  const timeout = setTimeout(() => setLoading(false), 2000); // Adjust the duration as needed
  return () => clearTimeout(timeout);
}, []);

if (loading) {
  return <Preloader />;
}

return(
    <main className="bg-gradient-to-r from-blue-600 to-pink-500 text-white py-16 px-6 lg:px-20">
      <Header/>
     
      
    <section className="w-full max-w-screen overflow-x-hidden" id="rig">
     
    <PerformanceSpecs/>

  </section>
  <section  id="gear">
    <Peripherals/>
  </section>
  <section id='games'>
    <Games/>
  </section>

  
  <Footer/>
  {showArrow && (
        <div
          onClick={scorllTorig}
          className="fixed bottom-4 right-4 cursor-pointer text-gray-700 dark:text-gray-300 hover:animate-pulse hover:scale-110 hover:text-pink-500 dark:hover:text-blue-500 transition-colors duration-300"
        >
          <FaChevronCircleUp size={40} />
        </div>
      )}
  </main>

)
}