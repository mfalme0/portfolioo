import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import profile from '../../Images/Mfalme.jpg'; // Ensure this path is correct

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
      className={` w-full relative flex flex-col items-center justify-center h-screen ${gradientClass} text-white p-6 sm:p-12`}
    >
      <div className="relative flex flex-col items-center bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-8 sm:p-10 lg:p-12 shadow-lg">
        <Image
          src={profile}
          alt="Your Profile Picture"
          className="rounded-full grayscale blur hover:blur-0 hover:saturate-100 hover:grayscale-0 hover:scale-105 transition-transform duration-300"
          width={150}
          height={150}
          priority
        />
        <p className="mt-6 text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-200 max-w-2xl">
          I am a mid developer who will absolutely destroy you in{' '}
          <strong className="text-glitch">Counter-Strike</strong> or any other
          shooter and am an avid <strong className="text-glitch">anime</strong> enjoyer.
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wide drop-shadow-lg">
          {greeting}
        </h1>
      </div>
    </section>
  );
}
