import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import profile from '../../Images/Mfalme.jpg'

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
      className={`w-full h-screen ${gradientClass} flex items-center justify-center text-white relative p-6 sm:p-12`}
    >
      <div className="absolute top-6 left-6 sm:top-10 sm:left-10 z-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wide neon-text drop-shadow-lg">
          {greeting}
        </h1>
       
      </div>
      <header className="w-full max-w-5xl flex flex-col items-center text-center mb-16 p-5">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 ">Joseph Gitau</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Software Engineer | Gamer | Nerd</p>
        <div>
              <Image
          src={profile}
          alt="Your Profile Picture"
          className="rounded-full grayscale blur hover:blur-0 hover:saturate-100 hover:grayscale-0 hover:scale-110 transition-transform duration-200"
          width={150}
          height={150}
          priority
        />
        </div>
    
      </header>
      <div className="relative flex flex-col items-center bg-opacity-30 backdrop-blur-md rounded-lg p-8 sm:p-10 lg:p-12 shadow-xl z-20">
        <p className="text-2xl sm:text-3xl md:text-4xl text-gray-100 neon-text max-w-2xl tracking-wide text-center">
        Welcome to my digital portfolio—a space where creativity meets technology, and innovation comes to life.
          
        </p>
      </div>
    </section>
  );
}
