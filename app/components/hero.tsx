import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import profile from '../../Images/Mfalme.jpg';
import { FaArrowDown } from 'react-icons/fa';

export function Hero() {
  const [greeting, setGreeting] = useState('');
  const [gradientClass, setGradientClass] = useState('bg-gradient-to-r from-blue-500 to-purple-600'); // Default gradient

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting('Good Morning! 🌞');
      setGradientClass('bg-gradient-to-r from-yellow-400 to-orange-500');
    } else if (hour < 18) {
      setGreeting('Good Afternoon! 🌤️');
      setGradientClass('bg-gradient-to-r from-blue-500 to-teal-400');
    } else if (hour < 21) {
      setGreeting('Good Evening! 🌇');
      setGradientClass('bg-gradient-to-r from-purple-500 to-red-500');
    } else {
      setGreeting('Good Night! 🌙');
      setGradientClass('bg-gradient-to-r from-gray-800 to-black');
    }
  }, []);

  return (
    <section
      className={`w-full h-screen ${gradientClass} flex flex-col items-center justify-center text-white relative p-4 sm:p-8`}
    >
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide neon-text drop-shadow-lg">
          {greeting}
        </h1>
      </div>
      <header className="w-full max-w-4xl flex flex-col items-center text-center mb-12 sm:mb-16 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">
          Joseph Gitau
        </h1>
        <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 mt-2">
          Software Engineer | Gamer | Nerd
        </p>
        <div className="mt-4 sm:mt-6">
          <Image
            src={profile}
            alt="Your Profile Picture"
            className="rounded-full grayscale blur-sm hover:blur-0 hover:saturate-100 hover:grayscale-0 hover:scale-105 transition-transform duration-200"
            width={120}
            height={120}
            priority
          />
        </div>
      </header>
      <div className="relative flex flex-col items-center bg-opacity-30 backdrop-blur-md rounded-lg p-6 sm:p-8 lg:p-10 shadow-xl z-20 mx-4 sm:mx-6">
        <p className="text-lg sm:text-xl md:text-2xl text-gray-100 neon-text max-w-2xl tracking-wide text-center">
          Welcome to my digital portfolio. A space where creativity meets technology, and innovation comes to life.
        </p>
      </div>
      <div className="absolute bottom-4 w-full flex justify-center">
        <a href="#experience" className="flex items-center">
          <FaArrowDown className="animate-bounce text-white text-4xl hover:text-slate-700" />
        </a>
      </div>
    </section>
  );
}
