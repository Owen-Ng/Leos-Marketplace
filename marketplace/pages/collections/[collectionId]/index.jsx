import React from 'react' 
import {useRouter} from 'next/router';
import { LeosAddress } from '../../../secrets/contractAddress';
import LeosJSON from "../../../secrets/Leos.json";
import { rpcHttp } from '../../../secrets/contractAddress';
import { ethers } from 'ethers';
import { LeosCollectionAddress } from '../../../secrets/contractAddress';
import LeosCollectionJSON from "../../../secrets/LeosCollection.json"
import styled from "styled-components"
import { BsFillFileEarmarkPlusFill } from "react-icons/bs"; 
import Link from 'next/link';
import axios from 'axios'
const ButtonAbsolute = styled.div`
  position: absolute;
  right: 1px; 
`
const ImgFrame = styled.div` 
  display: flex;
  justify-content: center;
  width: 100%;
  height: 200px;
   
`
const Shadow = styled.div`
    cursor: pointer;
     border-radius: 12px;
     overflow: hidden;
    &:hover{
        box-shadow: 0 0 3px 3px white;
    }
`
const displayName = (rank) =>{
  while (rank.length < 4){
    rank = "0"+ rank;

  }
  return "#"+ rank;
}
const nft = () => {
    const router = useRouter();
    const {collectionId} = router.query;
    console.log(router.query)
    
    const [NFTs, setNFTs] = React.useState([]); 
    const [LoadingState, setLoadingState] = React.useState("not loaded");

    const loadNFTs = async() =>{
      if (collectionId !== undefined){
        const provider = new ethers.providers.JsonRpcProvider(rpcHttp ); 
        const LeosCollection = new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, provider);
        const Leos = new ethers.Contract(LeosAddress, LeosJSON.abi, provider);
        console.log(collectionId)
        const nftNFTs = await Leos.fetchCollectionItems(collectionId);

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
        setLoadingState("loaded");
      }
        
    }

    React.useEffect(()=>{
        loadNFTs();
    },[collectionId])
    
    return (
        <div> 
            <div>
            <ButtonAbsolute>
              <Link href={`/collections/${collectionId}/create-nft`}>
                <button  
                  className="flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 rounded-full cursor-pointer hover:bg-[#2546bd]"
                >
                  <BsFillFileEarmarkPlusFill className="text-white mr-2" />
                  <p className="text-white text-base font-semibold">
                    Create NFT
                  </p>
                </button>
              </Link>
            </ButtonAbsolute>
            {LoadingState === "loaded" && NFTs.length > 0? 
            
            <div className="flex justify-start">
            <div className="px-4" style={{ width: '1200px' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  NFTs.map((nft, i) => (
                        <Link key = {i} href={`/collections/${collectionId}/${nft.tokenId}`}>
                            <Shadow  > 
                                    <ImgFrame>
                                        <img src={nft.image}  />
                                    </ImgFrame>
                                    <div className="p-4"> 
                                        <div style={{ height: '20px', overflow: 'hidden' }}>
                                        <p className="text-gray-400">{displayName(nft.tokenId.toString())}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-black">
                                        <p className="text-l mb-4 font-bold text-white">{nft.price} MATIC</p>
                                        {/* <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button> */}
                                    </div> 
                            </Shadow>
                        </Link>
                  ))
                }
              </div>
            </div>
          </div>
            :
            "No nfts were created"
            }
        </div>
        </div>
    )
}

export default nft