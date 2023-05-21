import './App.css'
import { useEffect, useState } from 'react'
import ConnectWalletButton from './components/ConnectWalletButton'
import axios from 'axios'
import { connectMetamask } from './requests/metaRequests'


function App() {

  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [ref, setRef] = useState<HTMLInputElement | null>(null)
  const [fileToUplad, setFileToUpload] = useState<File | null>(null)


  const onPressTest = () => {
    ref?.click()
  }

  useEffect(() => {
    if (!fileToUplad) {
      return
    }
    alert(fileToUplad?.name)


  }, [fileToUplad])


  const onPressConnect = async () => {
    setLoading(true)

    const addressTemp: (string | Error) = await connectMetamask();

    if (addressTemp instanceof Error) {
      alert(addressTemp.message)
    } else {
      setAddress(addressTemp)
    }

    setLoading(false)
  }

  const onPressLogout = () => {
    setAddress("");
    localStorage.removeItem("customToken");
    //FIREBASE: signOut(auth);
  };

  const handleWelcome = async () => {
    //create a get request with auth header "Bearer customToken" to /api
    const baseUrl = "http://185.166.212.43:8001" //replace with specific domain url
    const customToken = localStorage.getItem("customToken");
    const response = await axios.get(`${baseUrl}/api/welcome`, {
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
        {/*hidden input with ref*/}
        <input
          ref={(ref) => { setRef(ref) }} type="file" hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) {
              return
            }
            setFileToUpload(file)
          }}
        />
        <button onClick={onPressTest}>Upload file</button>
      </header>
    </div>
  )
}

export default App
