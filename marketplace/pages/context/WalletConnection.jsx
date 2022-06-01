import React, {useEffect, useRef, useState} from 'react';
import Web3Modal, { getThemeColors } from 'web3modal' 
import { ethers } from 'ethers';
import { LeosAddress } from '../../secrets/contractAddress';
import { LeosCollectionAddress } from '../../secrets/contractAddress';
import LeosCollectionJSON from '../../secrets/LeosCollection.json'
import LeosJSON from '../../secrets/Leos.json';
import { rpcHttp } from '../../secrets/contractAddress';
export const WalletContext = React.createContext();

export const WalletProvider = ({children}) =>{
    const [currentAccount, setCurrentAccount] = React.useState(undefined);
    const [Signer, setSigner] = React.useState(undefined);
    const genericProvider = new ethers.providers.JsonRpcProvider(rpcHttp ); 
     
    const [eth, setEth] = React.useState(undefined);
    
    useEffect(() => { 
         setEth(window.ethereum) 
    }, [])

    useEffect(() =>{
        if (eth){
            IsWalletConnected().then(connected =>{
                if (connected >= 1){
                    ConnectWallet();
                    if (connected >= 2){
                        alert("More than 2 accounts connected");
                    }
                }
            })
        }
    }, [eth])

    
    const ConnectWallet = async () =>{
        if (eth){
            if (! Signer ){
                const web3Modal = new Web3Modal();
                const connection = await web3Modal.connect();
                const provider = new ethers.providers.Web3Provider(connection);
                const signer =  provider.getSigner();
                setSigner(signer);
                const address = await signer.getAddress();
                setCurrentAccount(address); 
            } 
        }else{
            console.log("Metamask not installed");
            alert("Please install Metamask");
        }
    }

    const IsWalletConnected = async () =>{ 
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts(); 
        return accounts.length  ;
    }
    const getLeosCollectionContract = () =>{   
        if (!Signer & !currentAccount){ 
            return new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi, genericProvider)

        }else {
            console.log("account connected")
            return new ethers.Contract(LeosCollectionAddress, LeosCollectionJSON.abi,Signer)

        }
    }
    const getLeosContract = () =>{  
        if (!Signer & !currentAccount){
            return new ethers.Contract(LeosAddress, LeosJSON.abi, genericProvider);
        }else{
            return new ethers.Contract(LeosAddress, LeosJSON.abi, Signer);

        }
    }

    


    return (
        <WalletContext.Provider value = {{getLeosContract, getLeosCollectionContract, ConnectWallet, currentAccount}}>
            {children}
        </WalletContext.Provider>
    )

 

} 