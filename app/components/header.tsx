import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
      

      const sections = ['hero', 'experience', 'projects', 'techstack', 'contact'];
      

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
    
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Call it once to set initial state
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Helper function to determine if a link is active
  const isActive = (section: string) => {
    return section === activeSection;
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
                href="#hero"
                className={`transition-colors duration-300 ${
                  isActive('hero')
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#experience"
                className={`transition-colors duration-300 ${
                  isActive('experience')
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Work Experience
              </a>
            </li>
            <li>
              <a
                href="#projects"
                className={`transition-colors duration-300 ${
                  isActive('projects')
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Projects
              </a>
            </li>
            <li>
              <a
                href="#techstack"
                className={`transition-colors duration-300 ${
                  isActive('techstack')
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Techstack
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={`transition-colors duration-300 ${
                  isActive('contact')
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Contact
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
                  href="#hero"
                  onClick={toggleMenu}
                  className={`transition-colors duration-300 ${
                    isActive('hero') 
                      ? 'text-blue-400 font-medium' 
                      : 'hover:text-gray-400'
                  }`}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#experience"
                  onClick={toggleMenu}
                  className={`transition-colors duration-300 ${
                    isActive('experience') 
                      ? 'text-blue-400 font-medium' 
                      : 'hover:text-gray-400'
                  }`}
                >
                  Work Experience
                </a>
              </li>
              <li>
                <a
                  href="#projects"
                  onClick={toggleMenu}
                  className={`transition-colors duration-300 ${
                    isActive('projects') 
                      ? 'text-blue-400 font-medium' 
                      : 'hover:text-gray-400'
                  }`}
                >
                  Projects
                </a>
              </li>
              <li>
                <a
                  href="#techstack"
                  onClick={toggleMenu}
                  className={`transition-colors duration-300 ${
                    isActive('techstack') 
                      ? 'text-blue-400 font-medium' 
                      : 'hover:text-gray-400'
                  }`}
                >
                  Techstack
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={toggleMenu}
                  className={`transition-colors duration-300 ${
                    isActive('contact') 
                      ? 'text-blue-400 font-medium' 
                      : 'hover:text-gray-400'
                  }`}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}