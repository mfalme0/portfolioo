import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import profile from '../../Images/Mfalme.jpg';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    

  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-opacity-80 bg-white dark:bg-gray-900' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">


          {/* Centered Navigation */}
          <ul className="hidden md:flex space-x-6 text-lg justify-center flex-1">
            <li>
              <a
                href="#rig"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              >
                Rig
              </a>
            </li>
            <li>
              <a
                href="#gear"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              >
                Gear
              </a>
            </li>
            <li>
              <a
                href="#games"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300"
              >
                Games
              </a>
            </li>

          </ul>



          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Full-Screen Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex flex-col justify-center items-center z-50">
            <button
              onClick={toggleMenu}
              className="absolute top-8 right-8 text-white focus:outline-none"
            >
              <FiX size={30} />
            </button>
            <ul className="space-y-8 text-2xl text-white">
              <li>
                <a
                  href="#rig"
                  onClick={toggleMenu}
                  className="hover:text-gray-400 transition-colors duration-300"
                >
                  Rig
                </a>
              </li>
              <li>
                <a
                  href="#gear"
                  onClick={toggleMenu}
                  className="hover:text-gray-400 transition-colors duration-300"
                >
                  Gear
                </a>
              </li>
              <li>
                <a
                  href="#games"
                  onClick={toggleMenu}
                  className="hover:text-gray-400 transition-colors duration-300"
                >
                  games
                </a>
              </li>


            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}
