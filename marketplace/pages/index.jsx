 
import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
// import { ethers } from 'ethers' 
import Link from 'next/link';
import { ethers } from 'ethers';
import axios from 'axios'
// import { LeosCollectionAddress } from '../secrets/contractAddress';
// import LeosCollectionJSON from "../secrets/LeosCollection.json";
import styled from "styled-components"
// import { LeosAddress } from '../secrets/contractAddress'
// import LeosNFTJSON from "../secrets/Leos.json";
import {  WalletContext} from "./context/WalletConnection" 
// import { rpcHttp } from '../secrets/contractAddress';
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
const shortenAddress = (address) => `${address.slice(0,5)}...${address.slice(address.length - 4, address.length)}`

const RandomCollection = ({Collections,account}) =>{
  // const Random = Math.floor(Math.random()* Collections.length) ;
  const Random = 2;
  return (
    <Link href={`/collections/${Collections[Random].tokenId}`}> 
           
          <Banner   className="border shadow rounded-xl overflow-hidden cursor-pointer">
            <ImgFrame>
              <img    src={Collections[Random ].image} />
            </ImgFrame>
            <div className="p-4">
              <p style={{ height: '20px' }} className="text-2xl font-semibold">{Collections[Random].name}</p>
              <div style={{ height: '20px', overflow: 'hidden' }}>
                <p className="text-gray-400">{Collections[Random].description}</p>
              </div>
              <div style={{ height: '10px',marginTop:"5px",display:'flex', justifyContent:"space-between"  }}>
                <p className="text-gray-400">  Owner: </p>
                <p className="text-gray-400"> {Collections[Random ].owner === account?"You": shortenAddress(Collections[Random ].owner)}</p>
              </div>
            </div>
            <div className="p-4 bg-black">
              <p className="text-l mb-4 font-bold text-white">Listing Price: <br/> {Collections[Random].price} MATIC</p>
              {/* <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(collection)}>Buy</button> */}
            </div>
          </Banner>
        </Link>
  )
}
const Home  = () => {
  const [Collections, setCollections] = React.useState([]);
  const [LoadingState, setLoadingState] = React.useState("not loaded");
  const [NFTs, setNFTs] = React.useState([]);
  const {getLeosCollectionContract, getLeosContract, currentAccount} = React.useContext(WalletContext)
 
  
  const loadCollections = async () =>{
        try{
          const LeosCollection = getLeosCollectionContract();
          const data = await LeosCollection.fetchAllCollections();  
          const items = await Promise.all(data.map(async i =>{ 
              const tokenUri = await LeosCollection.tokenURI(i.itemId);
              const meta = await axios.get(tokenUri);

              let price = ethers.utils.formatUnits(i.price.toString(), 'ether'); 
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
      const Leos = getLeosContract();
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
    setLoadingState("loaded")
  }

  React.useEffect(() => {
    LoadData();
  }, [])
  return ( 
    <div className="flex w-[60%] justify-center items-center m-auto">
      <div className="flex  w-[100%]  mf:flex-row flex-col items-start justify-around md:p-20 py-12 px-4">
        <div className="flex   justify-start items-start flex-col mf:mr-10">
          <h1 className="text-3xl sm:text-5xl text-white text-gradient py-1">
            Buy and Sell <br /> NFTs
          </h1>
          <p className="text-left mt-5 text-white font-light md:w-9/12 w-11/12 text-base">
            Explore the crypto world.  
          </p>
           

          <div className="grid sm:grid-cols-3 grid-cols-2 mf:w-[400px] w-[300px] mt-10 mb-[30px]">
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

        <div style={{width: "300px"}} className="flex shrink-0 items-center justify-center ">
          { LoadingState === "loaded" & Collections.length > 0 ?
           <RandomCollection Collections={Collections} account = {currentAccount}/>
        :
        ""
        }
          
        </div>

        
      </div>
    </div> 
  )
}

export default Home
