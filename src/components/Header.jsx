import React from "react";
import 'boxicons/css/boxicons.min.css'; 
const Header = () => {
  return (
    <header className="flex justify-between items-center
    py-4 px-4 lg:px-20">
        <h1 className="text-3xl md:text-4xl
        lg:text-5xl font-bold m-0 text-green-300">
            THE MEME TRUCK
        </h1>

        <button className="hidden md:block bg-[#cccc]
        text-black font-bold py-2 px-6 rounded
        border-2 border-black
        font-medium transition-all duration-500 cursor-pointer
        z-50">
            <i class='bx  bx-tag-alt'  ></i> 
            CA: afsfn9euewsjfbuasec 
        </button>

        <button className="hidden md:block bg-[#a7a7a7]
        text-black font-bold py-3 px-8 rounded-full
        border-2 border-black hover:bg-green-300
        font-medium transition-all duration-500 cursor-pointer
        z-50">
            BUY NOW
        </button>
        
    </header>
  )
}

export default Header;