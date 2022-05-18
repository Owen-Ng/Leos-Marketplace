 
import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
import { ethers } from 'ethers' 
import Link from 'next/link';
import axios from 'axios'
import { LeosCollectionAddress } from '../secrets/contractAddress';
import LeosCollectionJSON from "../secrets/LeosCollection.json";
import styled from "styled-components"
import { LeosAddress } from '../secrets/contractAddress'
import LeosNFTJSON from "../secrets/Leos.json";

import { rpcHttp } from '../secrets/contractAddress';
// import styled from "styled-components"
const companyCommonStyles = "min-h-[70px] sm:px-0 px-2 sm:min-w-[120px] flex justify-center items-center border-[0.5px] border-gray-400 text-sm font-light text-white";
const Banner = styled.div`
  /* background-color: #0c1740; */
  border-color: #364fa7;
  border-width: 1px;

  &:hover{
    box-shadow: 0 0 3px 3px #364fa7;
  }
`
const ImgFrame = styled.div` 
  display: flex;
  justify-content: center;
  width: 100%;
  height: 200px;
`
const Home  = () => {
  const [Collections, setCollections] = React.useState([]);
  const [LoadingState, setLoadingState] = React.useState("not loaded");
  const [NFTs, setNFTs] = React.useState([]);
  const provider = new ethers.providers.JsonRpcProvider(rpcHttp ); 
  const loadCollections = async () =>{
        try{
          const LeosCollection = new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, provider);
          const data = await LeosCollection.fetchAllCollections(); 
          console.log(data)
          const items = await Promise.all(data.map(async i =>{ 
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
        }catch(e){
          console.log("LoadCollections issue " + e);
        }
         
  }

  const loadNFTs = async () =>{ 
    try{ 
      const Leos = new ethers.Contract(LeosAddress, LeosNFTJSON.abi, provider); 
      const nftNFTs = await Leos.fetchMarketItems();

      const items = await Promise.all(nftNFTs.map(async i =>{ 
          const tokenUri = await Leos.tokenURI(i.itemId);
          const meta = await axios.get(tokenUri);

          let price = ethers.utils.formatUnits(i.price.toString(), 'ether');

          let item = {
              price,
              tokenId: i.itemId.toNumber(), 
              owner: i.owner,
              seller: i.seller,
              image: meta.data.image,
              name: meta.data.name,
              description: meta.data.description,
              sold: i.sold,  
              CollectionId: i.CollectionId,
              CollectionAddress: i.CollectionAddress
          }
          return item;
      }))
      setNFTs(items); 
    }catch(e){
      console.log("loadNfts issue" + e.toString());
    }
      
  }
  const LoadData = async() =>{
    loadCollections();
    loadNFTs();
    console.log(Collections)
    setLoadingState("loaded")
  }

  React.useEffect(() => {
    LoadData();
  }, [])
  return ( 
    <div className="flex w-full justify-center items-center">
      <div className="flex mf:flex-row flex-col items-start justify-between md:p-20 py-12 px-4">
        <div className="flex flex-2 justify-start items-start flex-col mf:mr-10">
          <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
            Buy and Sell <br /> NFTs
          </h1>
          <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
            Explore the crypto world.  
          </p>
           

          <div className="grid sm:grid-cols-3 grid-cols-2 w-full mt-10">
            <div className={`rounded-tl-2xl ${companyCommonStyles}`}>
              Reliability
            </div>
            <div className={companyCommonStyles}>Security</div>
            <div className={`sm:rounded-tr-2xl ${companyCommonStyles}`}>
              Matic
            </div>
            <div className={`sm:rounded-bl-2xl ${companyCommonStyles}`}>
              Web 3.0
            </div>
            <div className={companyCommonStyles}>Low Fees</div>
            <div className={`rounded-br-2xl ${companyCommonStyles}`}>
              Blockchain
            </div>
          </div>
        </div>

        <div style={{width: "500px"}} className="flex flex-col flex-1 items-center justify-end w-100px ">
          { LoadingState === "loaded" & Collections.length > 0 ?
          <Link href={`/collections/${Collections[0].tokenId}`}>
          <Banner   className="border shadow rounded-xl overflow-hidden cursor-pointer">
            <ImgFrame>
              <img src={Collections[Math.floor(Math.random()* Collections.length)  ].image} />
            </ImgFrame>
            <div className="p-4">
              <p style={{ height: '40px' }} className="text-2xl font-semibold">{Collections[0].name}</p>
              <div style={{ height: '20px', overflow: 'hidden' }}>
                <p className="text-gray-400">{Collections[0].description}</p>
              </div>
            </div>
            <div className="p-4 bg-black">
              <p className="text-l mb-4 font-bold text-white">Listing Price: <br/> {Collections[0].price} MATIC</p>
              {/* <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(collection)}>Buy</button> */}
            </div>
          </Banner>
        </Link>
        :
        ""
        }
          
        </div>

        
      </div>
    </div> 
  )
}

export default Home
