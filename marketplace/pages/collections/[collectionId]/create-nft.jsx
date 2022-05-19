import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal' 
import Link from 'next/link';

import { LeosAddress } from '../../../secrets/contractAddress'
import LeosNFTJSON from "../../../secrets/Leos.json";

import { LeosCollectionAddress } from '../../../secrets/contractAddress';
import LeosCollectionJSON from "../../../secrets/LeosCollection.json"
import { BsThreeDotsVertical } from 'react-icons/bs'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0') 
const CreateNft = () => {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '',  description: '' })
    const router = useRouter()
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
          const web3Modal = new Web3Modal( )
          const connection = await web3Modal.connect()
          const provider = new ethers.providers.Web3Provider(connection)    
          const signer = provider.getSigner()
          console.log(signer)
          
          console.log("awdadw")
          /* next, create the item */
          const NFTcontract = new ethers.Contract(LeosAddress, LeosNFTJSON.abi, signer) 
          const CollectionContract = new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, signer)
          console.log("awdadw")
          const price = ethers.utils.parseUnits(formInput.price, 'ether')
         
          const listingPrice = await NFTcontract.getListingPrice() 

          const collectionfee = await CollectionContract.getCollectionListingPrice(collectionId)

          const totalListingFee = listingPrice.add(collectionfee)


          console.log(listingPrice, collectionfee, totalListingFee)
          let transaction = await NFTcontract.createToken(url, price, collectionfee,collectionId, LeosCollectionAddress, { value: totalListingFee })
          await transaction.wait()
          router.push(`/collections/${collectionId}`)
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
              <button onClick={createNFTBundle} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                Create Digital Asset
              </button>
            </div>
          </div>
        )
}

export default CreateNft