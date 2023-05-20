import './App.css'

import Web3 from 'web3'
import { SetStateAction, useState } from 'react'
import ConnectWalletButton from './components/ConnectWalletButton'
import mobileCheck from './helpers/mobileCheck'
import getLinker from './helpers/deepLink'
import axios from 'axios'

function App() {

  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')

  const onPressConnect = async () => {
    setLoading(true)

    try {
      const webUrl = "http://localhost:8545" //replace with specific domain url
      const deepLink = `https://metamask.app.link/dapp/${webUrl}`
      const downloadMetamaskUrl = "https://metamask.io/download.html"

      if (window?.ethereum?.isMetaMask) {
        //Desktop browser
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })

        const account = Web3.utils.toChecksumAddress(accounts[0])
        await handleLogin(account)
      } else if (mobileCheck()) {
        //Mobile browser
        const linker = getLinker(downloadMetamaskUrl);
        linker.openURL(deepLink as string & Location);
      } else {
        window.open(downloadMetamaskUrl, '_blank')
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }


  

  const handleLogin = async (address: string) => {
    const baseUrl = "http://185.166.212.43:8001" //replace with specific domain url
    try {
      await axios.post(`${baseUrl}/register`, { address: address });
    } catch (error) {
      console.error(error);
    }

    const response = await axios.get(`${baseUrl}/users/${address}/nonce`);
    const messageToSign = response?.data?.Nonce;

    if (!messageToSign) {
      throw new Error("Invalid message to sign");
    }

    const web3 = new Web3(Web3.givenProvider);
    const signature = await web3.eth.personal.sign(messageToSign, address);
    console.log('address: ', address, 'messageToSign: ', messageToSign, 'signature: ', signature)
    const jwtResponse = await axios.post(
      `${baseUrl}/signin`, {Address:address,Nonce:messageToSign,Sig:signature}
    );

    //alert jwtResponse all data
    alert(JSON.stringify(jwtResponse))
    const customToken = jwtResponse?.data?.access;

    if (!customToken) {
      throw new Error("Invalid JWT");
    }
    alert(customToken)
    //save customToken to local storage
    localStorage.setItem("customToken", customToken);
    //FIREBASE: await signInWithCustomToken(auth, customToken);
    setAddress(address);
  };

  const onPressLogout = () => {
    setAddress("");
    localStorage.removeItem("customToken");
    //FIREBASE: signOut(auth);
  };

  const handleWelcome = async () => {
    //create a get request with auth header "Bearer customToken" to /welcome
    const baseUrl = "http://185.166.212.43:8001" //replace with specific domain url
    const customToken = localStorage.getItem("customToken");
    const response = await axios.get(`${baseUrl}/welcome`, {
      headers: {
        Authorization: `Bearer ${customToken}`,
      },
    });
    alert(JSON.stringify(response))
  }

  return (
    <div className="App">
      <header className="App-header">
        <ConnectWalletButton
          onPressConnect={onPressConnect}
          onPressLogout={onPressLogout}
          loading={loading}
          address={address}
          />
          <button onClick={handleWelcome}>Welcome</button>
      </header>
    </div>
  )
}

export default App
