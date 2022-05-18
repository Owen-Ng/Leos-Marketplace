import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from "../components/Navbar/Navbar"
import Head from 'next/head'
function MyApp({ Component, pageProps }: AppProps) {
  return (
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
  )
  
}

export default MyApp
