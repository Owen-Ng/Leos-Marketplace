import React,{ useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
 
import Link from 'next/link';
 
import { BsThreeDotsVertical } from 'react-icons/bs'
import { WalletContext } from '../../context/WalletConnection';
import Loader from '../../../components/Loader/Loader';
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0') 
const CreateNft = () => {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '',  description: '' })
    const router = useRouter();
    const [IsLoaded, setIsLoaded] = React.useState(true)
    const {getLeosContract, getLeosCollectionContract, ConnectWallet, currentAccount} = React.useContext(WalletContext);
    const {collectionId} = router.query;
     
    async function onChange(e) {
      const file = e.target.files[0]
      try {
        const added = await client.add(
          file,
          {
            progress: (prog) => console.log(`received: ${prog}`)
          }
        )
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        setFileUrl(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }
      }  
  
      async function createNFTBundle() {
          const {  price } = formInput
          if (  !price || !fileUrl) return
          /* first, upload to IPFS */
          const data = JSON.stringify({
            image: fileUrl
          })
          try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
            createNFT(url)
          } catch (error) {
            console.log('Error uploading file: ', error)
          }  
        }
        async function createNFT(url) {  
           
          try{
            /* next, create the item */
            const NFTcontract = getLeosContract(); 
            const CollectionContract = getLeosCollectionContract(); 
            const price = ethers.utils.parseUnits(formInput.price, 'ether')

            const listingPrice = await NFTcontract.getListingPrice() 

            const collectionfee = await CollectionContract.getCollectionListingPrice(collectionId)

            const totalListingFee =  listingPrice.add(collectionfee) 


            console.log(listingPrice, collectionfee, totalListingFee)
            setIsLoaded(false)
            let transaction = await NFTcontract.createToken(url, price, collectionfee,collectionId , { value: totalListingFee })
            await transaction.wait()
            setIsLoaded(true)
            router.push(`/collections/${collectionId}`)
          }catch(e){
            console.log("Create NFT : " + e);
            alert(e.data.message)
            setIsLoaded(true);
          }
          
        }
      
        return (
          <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
               
              <input
                placeholder="Asset Price in Eth"
                className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
              />
              <input
                type="file"
                name="Asset"
                className="my-4"
                onChange={onChange}
              />
              {
                fileUrl && (
                  <img className="rounded mt-4" width="350" src={fileUrl} />
                )
              }
              {IsLoaded === true? 
              <button onClick={createNFTBundle} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
              Create Digital Asset
            </button>:
            <Loader/> }
              
            </div>
          </div>
        )
}

export default CreateNft