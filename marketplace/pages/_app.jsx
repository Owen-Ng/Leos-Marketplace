import '../styles/globals.css' 
import Navbar from "../components/Navbar/Navbar"
import Head from 'next/head'
import {WalletProvider} from "../context/WalletConnection"
function MyApp({ Component, pageProps } ) {
  return (
    <WalletProvider>
      <div className="min-h-screen" style={{backgroundColor: "#000322"}}>
        <Head>
          <title>Leos Marketplace</title>
          <link rel="icon" href="/logo.png" />
        </Head>
        <div className='gradient-bg-welcome'>
          <Navbar/>
        </div> 
          <Component {...pageProps} /> 
      </div> 
  </WalletProvider>
  )
  
}

export default MyApp
