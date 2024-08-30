// components/Preloader.js

import React from "react";
import Image from "next/image";
import preloaderSvg from "../../Images/rings.svg"; // Update the path to your SVG

export default function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900">
      <Image src={preloaderSvg} alt="Loading..." width={150} height={150} />
    </div>
  );
}
