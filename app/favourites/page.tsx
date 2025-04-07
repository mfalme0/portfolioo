"use client"; // Add this line at the very top

import { useState, useEffect } from "react";
import Myshit from "../components/faves";
import Preloader from "../components/favesloader";
import Footer from "../components/Footer"
import { Games } from "../components/games";
import { FaChevronCircleUp } from "react-icons/fa";
import { Header } from "../components/favesheader";



export default function Goodshit() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const timeout = setTimeout(() => setLoading(false), 2000); // Adjust the duration as needed
        return () => clearTimeout(timeout);
      }, []);
      
      if (loading) {
        return <Preloader />;
      }

    return(
        <main className="w-max-screen h-full bg-gradient-to-t from-cyan-600 to-slate-500 text-white py-16 px-6 lg:px-20">
            <Header/>
  
            <section>
                <Myshit/>
            </section>
   
             < Footer />
       
        </main>
    )
}