import React from 'react'
import Link from 'next/link';
import axios from 'axios'
import {useRouter} from 'next/router';
import { LeosAddress } from '../../../../secrets/contractAddress';
import LeosJSON from "../../../../secrets/Leos.json";
import { rpcHttp } from '../../../../secrets/contractAddress';
import { ethers } from 'ethers';
import { LeosCollectionAddress } from '../../../../secrets/contractAddress';
import LeosCollectionJSON from "../../../../secrets/LeosCollection.json"
import styled from "styled-components"
import Web3Modal from 'web3modal' 

const Container = styled.div`
  
`
const Details = styled.div`
  margin: auto;
  width: 300px;
`
const ImgFrame = styled.div` 
  display: flex;
  justify-content: center;
  width: 100%;
  height: 200px;
   
`

const displayName = (rank) =>{
  while (rank.length < 4){
    rank = "0"+ rank;

  }
  return "#"+ rank;
}
const Detail = () => {
    const router = useRouter();
    const {collectionId, nft} = router.query;
    const [nftNft, setNftNft] = React.useState();
    
    const LoadNft = async()=>{

      if (collectionId !== undefined){
        const provider = new ethers.providers.JsonRpcProvider(rpcHttp ); 
        const LeosCollection = new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, provider);
        const Leos = new ethers.Contract(LeosAddress, LeosJSON.abi, provider);
        console.log(collectionId)
        const  item = await Leos.getItem(nft);
        
        const tokenUri = await Leos.tokenURI(item.itemId);
        const meta = await axios.get(tokenUri);

        let price = ethers.utils.formatUnits(item.price.toString(), 'ether'); 
        setNftNft(
          {
            price,
            tokenId: item.itemId.toNumber(), 
            owner: item.owner,
            seller: item.seller,
            image: meta.data.image,  
            sold: item.sold,  
            CollectionId: item.CollectionId,
            CollectionAddress: item.CollectionAddress
          }
        )   
    } 
  }

  const Sale = async() =>{
    const web3Modal = new Web3Modal( )
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    const LeosCollection = new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, signer);
    const Leos = new ethers.Contract(LeosAddress, LeosJSON.abi, signer);
    const collectionOwnerAddress = await LeosCollection.getOwner(collectionId);
    const collectionListingFee = await LeosCollection.getCollectionListingPrice(collectionId) ;
    const nftListingFee = await Leos.getListingPrice();
    console.log(nftListingFee,nft, collectionOwnerAddress , collectionListingFee)
    const p = ethers.utils.parseUnits(nftNft.price.toString(), 'ether')
    const transaction = await Leos.createMarketSale(nft, collectionOwnerAddress , collectionListingFee, {value : p} )
    transaction.wait()

  }
  React.useEffect(()=>{
    LoadNft();
  },[collectionId, nft])
  return (
    <Container>
      <Details>
        {nftNft !== undefined? 
        <div>
          <div  className="border shadow rounded-xl overflow-hidden">
            <ImgFrame>
              <img src={nftNft.image}  />
            </ImgFrame>
            <div className="p-4"> 
              <div style={{ height: '20px', overflow: 'hidden' }}>
                <p className="text-gray-400"> {displayName(nftNft.tokenId.toString())}</p> 
              </div>
            </div>
            <div className="p-4 bg-black">
              {nft}
              <p className="text-l mb-4 font-bold text-white">{nftNft.price} MATIC</p>
            </div>
          </div>
          {nftNft.sold === true? 
          ""
          :

          <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded-xl my-3" onClick={() => Sale()}>Buy</button> 
          }
          </div>
        :
        ""
        }
        
      </Details>

    </Container>
  )
}

export default Detail