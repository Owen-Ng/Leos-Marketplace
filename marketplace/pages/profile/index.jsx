import React from 'react'
import { SiEthereum } from "react-icons/si";
import { BsInfoCircle } from "react-icons/bs";
import Web3Modal from 'web3modal' 
import { ethers } from 'ethers' 
import styled from "styled-components"
 
const Profile = () => {
  const [currentAccount, setcurrentAccount] = React.useState();
  const [currentBalance, setCurrentBalance] = React.useState();
  const shortenAddress = (address) => `${address.slice(0,5)}...${address.slice(address.length - 4, address.length)}`
  const LoadInfo = async () =>{
    const web3Modal = new Web3Modal( )
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)    
    const signer = provider.getSigner()
    
    const balance = await signer.getBalance();
    const address = await signer.getAddress();

    setcurrentAccount(address)
    setCurrentBalance(shortenAddress(ethers.utils.formatEther(balance)));
  }

  React.useEffect(() =>{
    LoadInfo()
  },[])

  return (
    <Center>
      <div style = {{width:"400px", height:"200px", margin:"auto"}} className="p-3 rounded-xl h-40 my-5 eth-card .white-glassmorphism ">
        <div className="flex justify-between flex-col w-full h-full">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full border-2 border-white flex justify-center items-center">
              <SiEthereum fontSize={21} color="#fff" /> 
            </div> 
            <BsInfoCircle fontSize={17} color="#fff" />
          </div>
          <div>
          
            <p className="text-white font-light text-sm">
              {currentAccount?shortenAddress(currentAccount):""}  
            </p>
            <div className="flex justify-between items-start">
              <p className="text-white font-semibold text-lg mt-1">
                Ethereum
              </p>
              <p className="text-white font-light text-sm">
          {currentBalance?currentBalance +" ETH":""} 
          </p>
            </div>
          </div>
        </div>
      </div>
    </Center>
  )
}

export default Profile