import React from 'react'
import Link from 'next/link';
import axios from 'axios'
import {useRouter} from 'next/router'; 
import styled from "styled-components" 
import {WalletContext} from "../../../context/WalletConnection"
import { ethers } from 'ethers';
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
    const [Input, setInput] = React.useState(false);
    const [FormInput, setFormInput] = React.useState({price: ""})
    const {getLeosCollectionContract, getLeosContract, ConnectWallet, currentAccount} = React.useContext(WalletContext)
    const LoadNft = async()=>{

      if (collectionId !== undefined){ 
        const LeosCollection = getLeosCollectionContract();
        const Leos = getLeosContract(); 
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
  

  const Buy = async() =>{  
    const LeosCollection = getLeosCollectionContract();
    const Leos = getLeosContract();
    const collectionOwnerAddress = await LeosCollection.getOwner(collectionId);
    const collectionListingFee = await LeosCollection.getCollectionListingPrice(collectionId) ;
    const nftListingFee = await Leos.getListingPrice();
    console.log(nftListingFee,nft, collectionOwnerAddress , collectionListingFee)
    const p = ethers.utils.parseUnits(nftNft.price.toString(), 'ether')
    const transaction = await Leos.createMarketSale(nft, collectionOwnerAddress , collectionListingFee, {value : p} )
    transaction.wait() 
  }
  const Sell = async() =>{ 
    const Leos = getLeosContract();
    const ListingFee = await Leos.getListingPrice();
    const price = ethers.utils.parseUnits(FormInput.price, 'ether');
    const transaction = await Leos.resellToken(nft, price, {value: ListingFee})
    transaction.wait();
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
          {currentAccount === undefined? "" :
          nftNft.sold === true & nftNft.owner === currentAccount? 
             Input === true? 
             <div>
              <input
                  placeholder="Asset Price in Eth"
                  className="w-full mt-2 border rounded-xl p-4"
                  onChange={e => setFormInput({ ...FormInput, price: e.target.value })}
                />
                <div className=' flex justify-between'>
                  <button onClick={()=> setInput(false)} className="flex-auto w-[30%] bg-pink-800 text-white font-bold py-2 rounded-xl my-3 hover:bg-pink-700">
                      Cancel
                  </button>
                  <button onClick={()=>Sell()} className="flex-auto w-[65%]  bg-pink-500 text-white font-bold py-2  rounded-xl my-3 ml-[5px] hover:bg-pink-400">
                      Confirm
                  </button>
                </div>
              </div>
              : 
            
              <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded-xl my-3 hover:bg-pink-400" onClick={() => setInput(!Input)}>Sell</button> 

            

          :

          <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded-xl my-3" onClick={() => Buy()}>Buy</button> 
          }
          </div>
        :
        ""
        }
        {/* <p className="text-l mb-4 font-bold text-white text-center">Transactions</p> */}

        
      </Details>

    </Container>
  )
}

export default Detail