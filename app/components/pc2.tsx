import React from 'react';
import Image from 'next/image';
import front from '../../Images/rog_front.png';

export default function PerformanceSpecs() {
  return (
    <div className=" text-white py-16 px-6 lg:px-20">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-pink-300 mb-8">My Rig</h1>
      </div>

      {/* Description with Image */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center text-center md:text-left mb-16">
        {/* Device Image */}
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <div className="w-1/2 p-4">
            <Image
              src={front}
              alt="My Rig"
              layout="responsive"
              width={400}
              height={400}
              className="object-cover transition-all duration-1000 ease-in-out"
            />
          </div>
        </div>

        {/* Description Text */}
        <div className="md:ml-8 w-full md:w-1/2">
          <p className="text-lg leading-relaxed">
            The latest processors team up to take down gaming, multitasking, and more. 
            NVIDIA graphics up to a GeForce RTX™ 3050 GPU deliver smooth frame rates, while 
            up to an overclockable AMD Ryzen™ 7 4800H CPU powers through heavy lifting. 
            Armed with up to 16GB of high-performance DDR4-3200 RAM, you can game, stream, 
            and switch gears seamlessly. Up to 1TB of NVMe SSD storage accelerates load 
            times for games and apps, and a second M.2 slot lets you add another drive to expand your collection.
          </p>
          <p className="mt-4 text-sm">
            *Tested on ROG Strix G15 with NVIDIA® GeForce RTX™ 3050 graphics card, AMD Ryzen™ 7 4800H processor, and 16GB DDR4 RAM.
          </p>
        </div>
      </div>

      {/* Specs Section */}
      <div className="grid sm:grid-cols-2 md:grid-cols-6 gap-12 text-center mb-20 grid-rows-1">
        {/* Updated GPU Section */}
        <div>
          <div className="circle-box text-center mb-6">
            {/* GPU Title */}
            <div className="sub-title font-semibold text-base">NVIDIA<sup className="sup-text">®</sup> GeForce</div>
            
            {/* Circle with RTX Info */}
            <div className="w-36 h-36 mx-auto border-4 border-pink-500  rounded-full flex flex-col items-center justify-center mb-6">
              <div className="text-top text-xl">RTX™</div>
              <div className="text-bottom text-2xl font-bold">3050</div>
            </div>
            
            {/* GPU Label */}
            <div className="main-text text-base font-bold">GPU</div>
          </div>
        </div>

        {/* AMD CPU Section */}
        <div>
          <p className="font-semibold text-base">AMD</p>
          <div className="w-36 h-36 mx-auto border-4 border-pink-500 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">Ryzen™ 7 4800H</span>
          </div>
          
          <p className="text-base">CPU</p>
        </div>

        {/* Memory Section */}
        <div><p className="font-semibold text-base">Up to 64GB</p>
          <div className="w-36 h-36 mx-auto border-4 border-pink-500 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">16GB</span>
          </div>
          
          <p className="text-base">Memory</p>
        </div>

        {/* SSD Section */}
        <div><p className='font-semibold text-base'>up to 16TB</p>
          <div className="w-36 h-36 mx-auto border-4 border-pink-500 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl font-bold">1.5TB</span>
          </div>
          <p className="text-base">SSD</p>
        </div>

        {/* FPS Sections */}
        <div><p className="font-semibold text-base">Counter Strike</p>
          <div className="w-36 h-36 mx-auto border-4 border-pink-500 rounded-full flex items-center justify-center mb-6">
            
            <p className="text-2xl font-bold">200 FPS</p>
          </div>
          <p className="text-base">Average FPS</p>
        </div>
        <div><p className="font-semibold text-base">Forza Horizon 5</p>
          <div className="w-36 h-36 mx-auto border-4 border-pink-500 rounded-full flex items-center justify-center mb-6">
            
            <span className="text-2xl font-bold">117 FPS</span>
          </div>
          <p className="text-base">Average FPS</p>
        </div>
      </div>
    </div>
  );
}
