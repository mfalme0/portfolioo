import React from 'react';
import Image from 'next/image';
import { MdOutlineSpeakerGroup } from 'react-icons/md';
import { FaRegKeyboard } from 'react-icons/fa6';
import { BsFillMouseFill } from 'react-icons/bs';
import g935 from '@/Images/g935.webp';
import iem from '@/Images/iem.webp';
import modelo from '../../Images/model01.jpg';
import sc660 from '@/Images/aula.png';
import s2002 from '@/Images/s2022.jpg';
import arctis from '@/Images/att.jpg'
import hyperx from '@/Images/hyperx.jpg'
import targ from '@/Images/targ.webp'
import { PiMonitorFill } from "react-icons/pi";

// Peripherals Data
const peripherals = [
  {
    id: 1,
    name: 'Aula S2022 Mechanical Keyboard',
    image: s2002,
    specs: [
      'Switch type: Blue Switch',
      'RGB Lighting',
      'Anti-Ghosting Keys',
      'Programmable Macros',
    ],
    category: 'Keyboards',
    link: 'https://esgaming.co.ke/shop/gaming-mechanical-keyboard-with-multicolor-argb-backlight-aula-s-2022-blue-switch/',
    imagePosition: 'left',
  },
  {
    id: 2,
    name: 'KZ EDX Ultra IEM',
    image: iem,
    specs: [
      'Driver: 10mm Dual Magnetic Circuit Dynamic',
      'Frequency Range: 20Hz-40kHz',
      'Impedance: 24Ω',
      'Detachable cable',
    ],
    category: 'Audio',
    link: 'https://store.shufflepcs.co.ke/products/kz-edx-ultra-single-dynamic-driver-earphones-1dd-iem',
    imagePosition: 'right',
  },
  {
    id: 3,
    name: 'Logitech G935 Gaming Headset',
    image: g935,
    specs: [
      '50mm Pro-G Drivers',
      '7.1 Surround Sound',
      'Wireless (2.4 GHz)',
      'Lightsync RGB',
    ],
    category: 'Audio',
    link: 'https://anisumakenya.co.ke/product/logitech-g935-wireless-7-1-surround-sound-lightsync-gaming-headset/',
    imagePosition: 'left',
  },
  {
    id: 4,
    name: 'Glorious Model O Mouse',
    image: modelo,
    specs: [
      'Sensor: Pixart 3360',
      'Weight: 67g',
      'DPI: 12,000',
      'RGB Lighting',
    ],
    category: 'Mice',
    link: 'https://www.ubuy.ke/en/product/LKBLS6YS-glorious-model-o-gaming-mouse-matte-white-go-white?',
    imagePosition: 'right',
  },
  {
    id: 5,
    name: 'Aula SC660 Gaming Mouse',
    image: sc660,
    specs: [
      'Sensor: 10,000 DPI Optical',
      'RGB Lighting',
      'Adjustable DPI',
      'Ergonomic Design',
    ],
    category: 'Mice',
    link: 'https://esgaming.co.ke/shop/aula-sc660-transparent-wireless-gaming-mouse-with-led/0',
    imagePosition: 'left',
  },
  {
    id: 6,
    name: 'SteelSeries Arctis 5',
    image: arctis,
    specs: [
      'Speaker Drivers: 40mm Neodymium Drivers',
      'Hi-Res Capable Speaker',
      'DTS Headphone:X v2.0 Surround Sound',
      'Wireless Dual Battery System',
    ],
    category: 'Audio',
    link: 'https://www.whizz.co.ke/product/3385842/steelseries-arctis-5-rgb-illuminated-gaming-headset-with-dts-headphone-x-v2-0-surround-for-pc-and-playstation-4-black/',
    imagePosition: 'right',
  },
  {
    id: 7,
    name: 'HyperX Large Square Mouse Pad',
    image: hyperx, 
    specs: [
      'Material: Cloth surface',
      'Dimensions: 450mm x 400mm',
      'Anti-fray stitched edges',
      'Non-slip rubber base',
    ],
    category: 'Mice',
    link: 'https://techbuyz.co.ke/product/hyperx-fury-s-pro-gaming-mouse-padoptimized-for-precision-stitched-anti-fray-edges-x-large-900x420x4mm/',
    imagePosition: 'left',
  },

  {
    id: 8,
    name: 'TAR-G Gaming Monitor',
    image: targ, 
    specs: [
      '1440p ',
      '165Hz ',
      '27"',
      '1ms Response time',
    ],
    category: 'Monitor',
    link: 'https://esgaming.co.ke/shop/27-inch-2k-180hz-flat-gaming-monitor-with-lifting-rotatable-stand/',
    imagePosition: 'left',
  },
];

// Define a type for the category icons
const categoryIcons: Record<string, JSX.Element> = {
    Monitor: <PiMonitorFill className="text-3xl" />,
  Keyboards: <FaRegKeyboard className="text-3xl" />,
  Audio: <MdOutlineSpeakerGroup className="text-3xl" />,
  Mice: <BsFillMouseFill className="text-3xl" />,

};

const Peripherals: React.FC = () => {
  const categories = Object.keys(categoryIcons) as Array<keyof typeof categoryIcons>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      {categories.map((category) => (
        <div key={category}>
          <div className="flex items-center space-x-2 mb-4">
            {categoryIcons[category]}
            <h2 className="text-2xl font-bold text-gray-800">{category}</h2>
          </div>
          <div className="space-y-8">
            {peripherals
              .filter((peripheral) => peripheral.category === category)
              .map((peripheral) => (
                <div
                  key={peripheral.id}
                  className={`flex ${
                    peripheral.imagePosition === 'left'
                      ? 'flex-row'
                      : 'flex-row-reverse'
                  } items-center space-x-6 bg-white p-6 shadow-md rounded-md`}
                >
                  {peripheral.image ? (
                    <Image
                      src={peripheral.image}
                      alt={peripheral.name}
                      height={500}
                      width={500}
                      className="w-1/3 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-1/3 h-60 bg-gray-200 flex items-center justify-center rounded-md">
                      <span className="text-gray-500">Image Unavailable</span>
                    </div>
                  )}
                  <div className="w-2/3 space-y-2">
                    <h3 className="text-xl font-semibold text-gray-700">
                      {peripheral.name}
                    </h3>
                    <ul className="list-disc pl-6 text-gray-600">
                      {peripheral.specs.map((spec, index) => (
                        <li key={index}>{spec}</li>
                      ))}
                    </ul>
                    <a
                      href={peripheral.link}
                      className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-green-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buy Now
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Peripherals;
