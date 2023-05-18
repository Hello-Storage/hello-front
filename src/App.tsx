import './App.css'

import Web3 from 'web3'
import { useState } from 'react'
import ConnectWalletButton from './components/ConnectWalletButton'

function App() {

  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')

  const onPressConnect = async () => {
    setLoading(true)

    try {
      const webUrl = "https://localhost:8545" //replace with specific domain url
      const deepLink = `https://metamask.app.link/dapp/${webUrl}`
      const downloadMetamaskUrl = "https://metamask.io/download.html"

      if (window?.ethereum?.isMetaMask) {
        //Desktop browser
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })

        const account = Web3.utils.toChecksumAddress(accounts[0])
        setAddress(account)
        console.log(account)
      } else if (mobileCheck()) {
        //Mobile browser
        const linker = getLinker(downloadMetamaskUrl);
        linker.openURL(deepLink);
      } else {
        window.open(downloadMetamaskUrl, '_blank')
      }
    } catch (error) {
      console.error(error)
    }

    setLoading(false)
  }

  const onPressLogout = () => setAddress("")

  return (
    <div className="App">
      <header className="App-header">
        <ConnectWalletButton
          onPressConnect={onPressConnect}
          onPressLogout={onPressLogout}
          loading={loading}
          address={address}
          />
      </header>
    </div>
  )
}

export default App
