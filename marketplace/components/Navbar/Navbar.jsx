import React from "react";
import { HiMenuAlt4 } from "react-icons/hi";
import { AiOutlineClose } from "react-icons/ai";
import Link from 'next/link';
import logo from "../../public/logo.png";
  
const Navbar = () => {
  const [toggleMenu, setToggleMenu] = React.useState(false); 
  return (
    <nav className="w-full flex md:justify-center justify-between items-center p-4">
        <Link href="/">
            <div  className="text-white md:flex-[0.5]  flex-initial justify-center items-center">
                <div className="display: inline-flex  ">
                    <img src={logo.src} alt="logo" className="w-12 cursor-pointer" /> <span className="font-bold text-xl p-3 text-gradient cursor-pointer">Leos Marketplace</span> 
                </div> 
            </div>
        </Link>
      <ul className="text-white md:flex hidden list-none flex-row justify-between items-center flex-initial">
        <Link href="/collections">
            <li className={`mx-4 cursor-pointer`} >Collections</li>
        </Link>
        <Link href={{pathname: "/portfolio", query: {data: "Hello"}}}>
            <li className={`mx-4 cursor-pointer`} >My Portfolio</li>
        </Link>
        <Link href="/profile">
            <li className={`mx-4 cursor-pointer`} >Profile</li>
        </Link>  
      </ul>
      <div className="flex relative">
        {!toggleMenu && (
          <HiMenuAlt4 fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(true)} />
        )}
        {toggleMenu && (
          <AiOutlineClose fontSize={28} className="text-white md:hidden cursor-pointer" onClick={() => setToggleMenu(false)} />
        )}
        {toggleMenu && (
          <ul
            className="z-10 fixed -top-0 -right-2 p-3 w-[70vw] h-screen shadow-2xl md:hidden list-none
            flex flex-col justify-start items-end rounded-md blue-glassmorphism text-white animate-slide-in "
          >
            <li className="text-xl w-full my-2 cursor-pointer "><AiOutlineClose onClick={() => setToggleMenu(false)} /></li>
            <Link href="/collections">
                <li className={`mx-4 cursor-pointer`} >Collections</li>
            </Link>
            <Link href="/portfolio">
                <li className={`mx-4 cursor-pointer`} >My Portfolio</li>
            </Link>
            <Link href="/profile">
                <li className={`mx-4 cursor-pointer`} >Profile</li>
            </Link>   
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;