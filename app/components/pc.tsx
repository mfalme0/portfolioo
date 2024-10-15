import { useState, useEffect } from 'react';
import Image from 'next/image';
import bottom from '../../images/rog_bottom.png';
import top from '../../images/rog_top.png';
import thumbnail from '../../images/rog1_front.png';
import front from '../../images/rog_front.png';
import left from '../../images/rog_left.png';
import right from '../../images/rog_right.png';

export default function MyRig() {
  const images = [ front, left, right, bottom, top];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 1750); // Change every 1.25 seconds

    return () => clearInterval(interval); // Clean up on component unmount
  }, [images.length]);

  return (
    <div className="flex items-center justify-center h-screen">
      {/* Left Section - Image */}
      <div className="w-1/2 p-4">
        <Image
          src={images[currentImageIndex]}
          alt="My Rig"
          layout="fit"
          width={400}
          height={400}
          className="object-cover transition-all duration-1000 ease-in-out"
        />
      </div>

      {/* Right Section - Specs */}
      <div className="w-1/2 p-4">
        <h2 className="text-3xl font-bold mb-4">My Rig Specs</h2>
        <ul className="space-y-2">
          <li><strong>CPU:</strong> AMD Ryzen 7 4800H</li>
          <li><strong>GPU:</strong> NVIDIA RTX 3050</li>
          <li><strong>RAM:</strong> 16GB DDR4</li>
          <li><strong>Storage:</strong> 1TB NVMe SSD</li>
          <li><strong>Cooling:</strong> liquid metal</li>
          <li><strong>Display:</strong> 15.6 HD, 144Hz</li>
        </ul>
      </div>
    </div>
  );
}
