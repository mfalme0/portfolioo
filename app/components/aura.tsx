import React from 'react';
import { FaHeadphones, FaLaptop, FaMouse } from 'react-icons/fa'; // Importing device icons

const AuraSyncComponent = () => {
  return (
    <div className="main-bg relative bg-gray-800 p-6">
      {/* Title Section */}
      <div className="title text-center mb-10">
        <div className="box-title relative">
          <div className="box-bg-revert bg-gradient-to-r from-blue-500 to-purple-500 h-2 w-full mb-2"></div>
          <h1 className="trade text-4xl font-bold text-white">AURA SYNC</h1>
        </div>
        <div className="rainbow-text trade text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 mt-2">
          Aura Sync lets your personality shine
        </div>
      </div>

      {/* Description Section */}
      <div className="text roboto text-lg text-gray-300 mb-10">
        Dim the lights and let Aura Sync take center stage. Illumination across the keyboard filters up through clear edges around the keys, and optional per-key RGB lets you highlight critical commands for quick navigation. Customizable colors extend into the light bar wrapped around three edges of the chassis, highlighting your setup with underglow. Add your favorite Aura Sync devices to make a matching environment all your own. Set the mood for immersive play. Link effects to in-game events. Show your true colors with a personalized experience.
      </div>

      {/* Product Section */}
      <div className="product-box flex flex-col md:flex-row justify-around items-center mb-10">
        {/* Headset Box */}
        <div className="headset-box relative flex flex-col items-center">
          <FaHeadphones className="text-6xl text-white glow-pulse mb-2" />
        </div>

        {/* NB Box */}
        <div className="nb-box flex flex-col items-center">
          <FaLaptop className="text-6xl text-white glow-pulse mb-2" />
        </div>

        {/* Mouse Box */}
        <div className="mouse-box relative flex flex-col items-center">
          <FaMouse className="text-6xl text-white glow-pulse mb-2" />
        </div>
      </div>

      {/* Color Box and Status Section */}
      <div className="color-box flex flex-col items-center">
        <div className="palette active flex gap-2 mb-6">
          <canvas className="w-12 h-12"></canvas>
          <canvas className="w-12 h-12"></canvas>
          <canvas className="w-12 h-12"></canvas>
        </div>
        <div className="status-box grid grid-cols-4 gap-4">
          <button className="status static bg-gray-600 text-white py-2 px-4 rounded-lg">
            Static
          </button>
          <button className="status breathing bg-gray-600 text-white py-2 px-4 rounded-lg">
            Breathing
          </button>
          <button className="status strobing bg-gray-600 text-white py-2 px-4 rounded-lg">
            Strobing
          </button>
          <button className="status colorcycle bg-gray-600 text-white py-2 px-4 rounded-lg">
            Colorcycle
          </button>
          <button className="status rainbow bg-gradient-to-r from-red-500 to-yellow-500 text-white py-2 px-4 rounded-lg">
            Rainbow
          </button>
          <button className="status music bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg">
            Music
          </button>
          <button className="status smart bg-gray-600 text-white py-2 px-4 rounded-lg">
            Smart
          </button>
          <button className="status starry bg-gray-600 text-white py-2 px-4 rounded-lg">
            Starry night
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuraSyncComponent;
