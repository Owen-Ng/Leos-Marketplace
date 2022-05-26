import React from 'react' 
import { ethers } from 'ethers' 
import Link from 'next/link';
import axios from 'axios'
import { LeosCollectionAddress } from '../../secrets/contractAddress';
import LeosCollectionJSON from "../../secrets/LeosCollection.json";
import styled from "styled-components"
import { LeosAddress } from '../../secrets/contractAddress'
import LeosNFTJSON from "../../secrets/Leos.json";
import Web3Modal from 'web3modal' 

const ButtonAbsolute = styled.div`
  position: absolute;
  right: 1px; 
`
const Shadow = styled.div`
    cursor: pointer;
     border-radius: 12px;
     overflow: hidden;
    &:hover{
        box-shadow: 0 0 3px 3px white;
    }
`
const ImgFrame = styled.div` 
  display: flex;
  justify-content: center;
  width: 100%;
  height: 200px; 
`
const Banner = styled.div`
  /* background-color: #0c1740; */
  border-color: #364fa7;
  border-width: 1px;

  &:hover{
    box-shadow: 0 0 3px 3px #364fa7;
  }
`
const FlexBox = styled.div`
  display: flex;
`
const TextHeader = styled.div`
  margin: 10px;
  text-align: center;
  color: white;
  font-weight: bold;
`
const Portfolio = () => {
  const [OnSale, setOnSale] = React.useState([]);
  const [Own, setOwn] = React.useState([]);
  const [MyCollections, setMyCollections] = React.useState([]);
  const [IsLoaded, setIsLoaded] = React.useState(false);

  const displayName = (rank) =>{
    while (rank.length < 4){
      rank = "0"+ rank;
  
    }
    return "#"+ rank;
  }
  const LoadMyNfts = async(provider) =>{
    try{ 
      const Leos = new ethers.Contract(LeosAddress, LeosNFTJSON.abi, provider); 
      const nftNFTs = await Leos.fetchMyNFTs();

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
      setOwn(items); 
    }catch(e){
      console.log("loadNfts issue" + e.toString());
    }
  }

  const LoadMyCollections = async(provider) =>{
    try{
      const LeosCollection = new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, provider);
      const data = await LeosCollection.fetchMyCollections(); 
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
      setMyCollections(items);  
    }catch(e){
      console.log("LoadCollections issue " + e);
    }
  }

  const LoadData = async () =>{
    const web3Modal = new Web3Modal( )
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    LoadMyNfts(signer);
    LoadMyCollections(signer);
    setIsLoaded(true); 
  }

  React.useEffect(()=>{
    LoadData();
  },[])
  return (
    <div>
      <h1 style={{color: "white", margin: "10px"}}>Portfolio</h1>
      {IsLoaded === true & Own.length > 0? 
        <div>
          <TextHeader>My Inventory</TextHeader> 
          <FlexBox>
          {Own.map((nft, i)=>
// /collections/${collectionId}/${nft.tokenId}
          <Link href={`/collections/${nft.CollectionId}/${nft.tokenId}`}>
            <Shadow key={i + "sold"} className="w-[250px] m-2 border shadow rounded-xl overflow-hidden m-2  ">
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
          )}
          </FlexBox>
        </div> 
      :
      ""
       }
       

      {IsLoaded === true & MyCollections.length > 0? 
      <div>
        <TextHeader>My Collections</TextHeader>
        <FlexBox>
        {MyCollections.map((collection, i)=>
          <Link href={`/collections/${collection.tokenId}`}>
            <Banner key={i} className="w-[250px] m-2 border shadow rounded-xl overflow-hidden cursor-pointer">
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
            </Banner>
          </Link>
        
        )}
        </FlexBox>
      </div>
      :
      ""
      }
    </div>
  )
}

export default Portfolio