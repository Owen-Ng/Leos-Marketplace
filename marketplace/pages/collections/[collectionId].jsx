import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link';
import { LeosnftAddress } from '../../secrets/contractAddress';
import LeosnftJSON from "../../secrets/Leosnft.json"
import { LeosAddress } from '../../secrets/contractAddress';
import LeosJSON from "../../secrets/Leos.json";
import { rpcHttp } from '../../secrets/contractAddress';
import { ethers } from 'ethers';
const nft = () => {
    const router = useRouter();
    const {nftId} = router.query;
    const [NFTs, setNFTs] = React.useState([]); 
    const [LoadingState, setLoadingState] = React.useState("not loaded");

    const loadNFTs = () =>{
        const provider = new ethers.providers.JsonRpcProvider(rpcHttp ); 
        const Leosnft = new ethers.Contract(LeosnftAddress, LeosnftJSON.abi, provider);

        const Leos = new ethers.Contract(LeosAddress, LeosJSON.abi, provider);

        const nftNFTs = await Leos.fetchnftItems(nftId);

        const items = await Promise.all(nftNFTs.map(async i =>{ 
            const tokenUri = await Leosnft.tokenURI(i.itemId);
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
                nftId: i.nftId,
                nftAddress: i.nftAddress
            }
            return item;
        }))
        setNFTs(items);
        setLoadingState("loaded");
    }

    React.useEffect(()=>{
        loadNFTs();
    },[])
    
    return (
        <div>
            {nftId}
            {LoadingState === "loaded" && NFTs.length > 0? 
            <div className="flex justify-center">
            <div className="px-4" style={{ maxWidth: '1600px' }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  NFTs.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                      <img src={nft.image} />
                      <div className="p-4">
                        <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.itemId}</p>
                        <div style={{ height: '70px', overflow: 'hidden' }}>
                          <p className="text-gray-400">{nft.description}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-black">
                        <p className="text-2xl mb-4 font-bold text-white">{nft.price} MATIC</p>
                        {/* <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button> */}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
            :
            "No nfts were created"
            }
        </div>
    )
}

export default nft