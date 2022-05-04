import React from 'react'
import Navbar from "../../components/Navbar/Navbar"
import Link from 'next/link';
import { AiFillPlayCircle } from "react-icons/ai"; 
const Collections = () => {
  return (
    <div>Collections 
      <Link href={`/collections/create-collection`}>
      <button  
        className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
      >
        <AiFillPlayCircle className="text-white mr-2" />
        <p className="text-white text-base font-semibold">
          Connect Wallet
        </p>
      </button>
      </Link>
    </div>
  )
}

export default Collections