// components/Preloader.js

import React from "react";
import Image from "next/image";
import preloaderSvg from "@/Images/audio.svg"; // Update the path to your SVG

export default function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-r  from-cyan-600 to-slate-500 ">
      <Image src={preloaderSvg} alt="Loading..." width={150} height={150} />
    </div>
  );
}
