"use client"; // Ensures this is a client component

import React from "react";
import { BsSteam, BsLinkedin, BsTwitch, BsTwitterX, BsInstagram, BsDiscord, BsGithub } from "react-icons/bs";


export default function Footer() {
  return (
    <footer className="mt-16 text-center ">
      
      <p className="text-lg font-semibold mb-4">My Socials</p>
      <div className="flex justify-center flex-wrap gap-8 mb-4">
        {/* Add your links in the href attribute */}
        <a href="https://github.com/mfalme0" target="_blank" rel="noopener noreferrer" className=" hover:scale-125 transition-transform duration-200 hover:text-purple-600">
        <BsGithub size={40} />
        </a>
        <a href="https://www.linkedin.com/in/joseph-g-471678208/" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200 hover:text-sky-600">
          <BsLinkedin size={40} />
        </a>
        <a href="https://twitch.tv/joe_mfalme" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200 hover:text-violet-500">
          <BsTwitch size={40} />
        </a>
        <a href="https://steamcommunity.com/profiles/76561199234397892" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
          <BsSteam size={40} />
        </a>
        <a href="https://x.com/joemfalme001" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200 hover:text-glitch">
          <BsTwitterX size={40} />
        </a>
        <a href="https://www.instagram.com/mfalme.01/" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200">
          <BsInstagram size={40} />
        </a>
        <a href="https://discord.gg/rHF5c4mCYS" target="_blank" rel="noopener noreferrer" className="hover:scale-125 transition-transform duration-200 hover:text-indigo-500">
          <BsDiscord size={40} />
        </a>
      </div>
      <p className="text-center text-gray-500 dark:text-gray-400">&copy; {new Date().getFullYear()} Joseph Gitau. All rights reserved.</p>
    </footer>
  );
}
