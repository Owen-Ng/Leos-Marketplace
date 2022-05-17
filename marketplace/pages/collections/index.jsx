import React from 'react'
import Navbar from "../../components/Navbar/Navbar"
import Link from 'next/link';
import { AiFillPlayCircle } from "react-icons/ai"; 
import { BsFillFileEarmarkPlusFill } from "react-icons/bs"; 

import {useRouter} from 'next/router';
import axios from 'axios'
import Web3Modal from "web3modal"
import { ethers } from 'ethers' 
import { LeosCollectionAddress } from '../../secrets/contractAddress';
import LeosCollectionJSON from "../../secrets/LeosCollection.json";
import { rpcHttp } from '../../secrets/contractAddress';
import styled from "styled-components"

const ButtonAbsolute = styled.div`
  position: absolute;
  right: 0px; 
`
const ImgFrame = styled.div` 
  display: flex;
  justify-content: center;
  width: 100%;
  height: 200px;
   
`
const Collections = () => { 
  const [Collections, setCollections] = React.useState();
    const [LoadingState, setLoadingState] = React.useState("not loaded");
    const loadCollections = async () =>{
        const provider = new ethers.providers.JsonRpcProvider(rpcHttp );
        console.log("test0")
        const LeosCollection = new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, provider);
        const data = await LeosCollection.fetchAllCollections();
        console.log("test")
        console.log(data)
        const items = await Promise.all(data.map(async i =>{
            console.log("test1")
            const tokenUri = await LeosCollection.tokenURI(i.itemId);
            const meta = await axios.get(tokenUri);

            let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
            console.log(i.itemId)
            let item = {
                price,
                tokenId: i.itemId, 
                owner: i.owner,
                image: meta.data.image,
                name: meta.data.name,
                description: meta.data.description
            }
            return item;
        }))
        setCollections(items);  
        setLoadingState("loaded")
    }
    React.useEffect(()=>{
        loadCollections();
    },[]) 

  return (
    <div>
      Collections 
      
        <div> 
          <ButtonAbsolute>
          <Link href={`/collections/create-collection`}>
            <button  
              className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
            >
              <BsFillFileEarmarkPlusFill className="text-white mr-2" />
              <p className="text-white text-base font-semibold">
                Create Collection
              </p>
            </button>
          </Link>
          </ButtonAbsolute>
            {LoadingState === "loaded" && Collections.length > 0? 
            <div className="flex justify-start">
            <div className="px-4" style={{ width: '1200px' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  Collections.map((collection, i) => (
                    <Link href={`/collections/${collection.tokenId}`}>
                      <div key={i} className="border shadow rounded-xl overflow-hidden cursor-pointer">
                        <ImgFrame>
                          <img src={collection.image} />
                        </ImgFrame>
                        <div className="p-4">
                          <p style={{ height: '40px' }} className="text-2xl font-semibold">{collection.name}</p>
                          <div style={{ height: '20px', overflow: 'hidden' }}>
                            <p className="text-gray-400">{collection.description}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-black">
                          <p className="text-l mb-4 font-bold text-white">Listing Price: <br/> {collection.price} MATIC</p>
                          {/* <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(collection)}>Buy</button> */}
                        </div>
                      </div>
                    </Link>
                  ))
                }
              </div>
            </div>
          </div>
            :
            "No Collections were created"
            }
        </div>
    </div>
  )
} 

export default Collections