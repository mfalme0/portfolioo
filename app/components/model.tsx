import React from 'react';
import Image from 'next/image';
import { ChevronUp } from 'lucide-react';
import modelo from '../../Images/ll.jpg'

const GamingLaptopPromo = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <header className="p-4">
        <nav className="flex justify-end space-x-4">
          <a href="#" className="text-red-500 hover:text-red-400">Features</a>
          <a href="#" className="hover:text-gray-300">Tech Specs</a>
          <a href="#" className="hover:text-gray-300">Awards</a>
          <a href="#" className="hover:text-gray-300">Gallery</a>
          <a href="#" className="hover:text-gray-300">Support</a>
        </nav>
      </header>
      
      <main className="flex-grow flex items-center overflow-hidden">
        <div className="container mx-auto px-4 flex items-center relative">
          {/* Laptop Image */}
          <div className="w-2/3 -ml-1/4 relative z-10">
            <Image 
              src={modelo} 
              alt="Gaming Laptop" 
              className="w-full h-auto"
            />
          </div>
          
          {/* Specs Content */}
          <div className="w-1/2 ml-[-10%] z-20">
            <h2 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              Smaller size
            </h2>
            <p className="text-lg mb-6">
              The new Strix series packs serious gaming power into a more
              portable chassis. For 15 inch models, the footprint is 7% smaller
              than the previous generation, while 17 inch versions are 5%
              smaller. The trim and streamlined chassis makes it easier than
              ever to jump in-game anywhere. It also enables an 85%
              screen-to-body ratio with superslim bezels that make
              gameplay more immersive.
            </p>
          </div>
          
          {/* Bottom-right strip */}
          <div className="absolute bottom-0 right-0 w-1/2 h-1/4 bg-purple-700 transform -skew-x-12 z-0"></div>
          
          {/* Logo */}
          <div className="absolute bottom-4 right-4 bg-gray-800 p-2 rounded-full z-30">
            <Image
              src={modelo}
              alt="ROG Logo" 
              className="w-8 h-8 "
            />
          </div>
        </div>
      </main>
      
      <footer className="p-4 flex justify-center">
        <button className="bg-gray-800 hover:bg-gray-700 rounded-full p-2">
          <ChevronUp className="w-6 h-6" />
        </button>
      </footer>
    </div>
  );
};

export default GamingLaptopPromo;