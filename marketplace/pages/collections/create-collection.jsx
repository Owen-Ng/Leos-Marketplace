import React,{ useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Loader from '../../components/Loader/Loader'
import Web3Modal from 'web3modal' 
import Link from 'next/link';
import { LeosCollectionAddress } from '../../secrets/contractAddress'
import LeosCollectionJSON from "../../secrets/LeosCollection.json";
import { WalletContext } from '../../context/WalletConnection'
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0') 
const CreateCollection = () => {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '',  description: '' })
    const router = useRouter()
    const {getLeosCollectionContract, currentAccount} = React.useContext(WalletContext)
    const [IsLoaded, setIsLoaded] = React.useState(true)
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
  
      async function createMarketCollection() {
          const {name,   description, price } = formInput
          if ( !name || !description || !price || !fileUrl) return
          /* first, upload to IPFS */
          const data = JSON.stringify({
           name, description, image: fileUrl
          })
          try {
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
            createCollection(url)
          } catch (error) {
            console.log('Error uploading file: ', error)
          }  
        }
        async function createCollection(url) {  
           
          /* next, create the item */
          try{
            let contract = getLeosCollectionContract();
           
            const price = ethers.utils.parseUnits(formInput.price, 'ether')
           
            let listingPrice = await contract.getListingPrice()
            listingPrice = listingPrice.toString()
            setIsLoaded(false)
            let transaction = await contract.createCollection(url, price, formInput.description, { value: listingPrice })
            await transaction.wait()
            setIsLoaded(true)
            router.push('/collections')
          }catch(e){
            console.log("Creating collection error: " + e)
            alert(e.data.message)
            setIsLoaded(true);
          }
          
        }
      
        return (
          <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
              <input 
                placeholder="Asset Name"
                className="mt-8 border rounded p-4"
                onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
              />
              <textarea
                placeholder="Asset Description"
                className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
              />
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
               <button onClick={createMarketCollection} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
               Create Digital Asset
             </button>
             : <Loader/>
             }
             
            </div>
          </div>
        )
}

export default CreateCollection