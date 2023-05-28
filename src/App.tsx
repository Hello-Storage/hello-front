import './App.css'
import { FormEvent, useEffect, useState } from 'react'
import ConnectWalletButton from './components/ConnectWalletButton'
import axios from 'axios'
import { connectMetamask } from './requests/metaRequests'
import FileComponent from './components/FileComponent'
import { FileDB } from './types'
import Toast from './components/Toast'


function App() {


  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [ref, setRef] = useState<HTMLInputElement | null>(null)
  const [fileToUplad, setFileToUpload] = useState<File | null>(null)
  const [customToken, setCustomToken] = useState<string | null>(localStorage.getItem("customToken"));
  const [filesList, setFilesList] = useState<{ files: FileDB[] }>({ files: [] });
  const [displayedFilesList, setDisplayedFilesList] = useState<{ files: FileDB[] }>({ files: [] });
  const [searchTerm, setSearchTerm] = useState("")
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const baseUrl = "http://185.166.212.43:8001" //replace with specific domain url

  const onUploadFilePress = () => {
    ref?.click()
  }

  useEffect(() => {
    if (!fileToUplad) {
      return
    }
    //send a post request to baseurl/api/upload with auth header "Bearer customToken" and file in body
    const customToken = localStorage.getItem("customToken");
    const formData = new FormData();
    formData.append("file", fileToUplad);
    axios.post(`${baseUrl}/api/upload`, formData, {
      headers: {
        Authorization: `Bearer ${customToken}`,
      },
    }).then((response: {data: {files: FileDB}}) => {
      console.log(response)

      setFileToUpload(null)
      //update files list
      const file: FileDB = response.data.files

      filesList.files.push(file)

      setToastMessage("File uploaded successfully")
      setShowToast(true);

    }
    ).catch((error) => {
      console.log(error)
    }
    )



  }, [fileToUplad, filesList.files])


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
    setAddress(null);
    localStorage.removeItem("customToken");
    setCustomToken(null);
    setFilesList({ files: [] });
    setDisplayedFilesList({ files: [] }); // set displayed files list as well

    //FIREBASE: signOut(auth);
  };

  const handleWelcome = async () => {
    //create a get request with auth header "Bearer customToken" to /api
    const customToken = localStorage.getItem("customToken");
    const response = await axios.get(`${baseUrl}/api/welcome`, {
      headers: {
        Authorization: `Bearer ${customToken}`,
      },
    });

    setToastMessage(response.data.msg)
    setShowToast(true);
  }

  const deleteFileFromList = (file: FileDB | null) => {
    if (file !== null) {
      const updatedFilesList = displayedFilesList.files.filter((item: FileDB) => item.cid !== file.cid);
      setDisplayedFilesList({ ...displayedFilesList, files: updatedFilesList });
    }
  }

  useEffect(() => {
    //get files list from /api/files with auth header "Bearer customToken"
    const customToken = localStorage.getItem("customToken");
    axios.get(`${baseUrl}/api/files`, {
      headers: {
        Authorization: `Bearer ${customToken}`,
      },
    }).then((response) => {
      setFilesList(response.data)
      setDisplayedFilesList(response.data) // set displayed files list as well
      console.log(response.data)
      handleWelcome()
    }).catch((error) => {
      console.log(error)
      //logout
      setFilesList({ files: [] });
      setDisplayedFilesList({ files: [] }); // set displayed files list as well
      setAddress(null);
      localStorage.removeItem("customToken");
    })


  }, [address])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (filesList && filesList.files) {
      //remove all files from filesList that do not contain searchTerm in their filename

      const filteredFiles = filesList.files.filter((file: FileDB) => {
        if (searchTerm == "") return true;
        return file.filename.includes(searchTerm)
      })
      // Set a new state with the updated files list.
      setDisplayedFilesList({ ...filesList, files: filteredFiles });
    }
  }


  return (
    <div className="App">

      <header className="App-header">
        <Toast toastState={[showToast, setShowToast]} message={toastMessage} />
        <ConnectWalletButton
          onPressConnect={onPressConnect}
          onPressLogout={onPressLogout}
          loading={loading}
          address={address}
          customToken={customToken}
        />


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
      </header>
      <div>
        <button onClick={onUploadFilePress}>Upload file</button>
        <p>Your uploaded files:</p>
        <form className="m-2 d-flex" onSubmit={(e: FormEvent<HTMLFormElement>) => handleSubmit(e)}>
          <input className='m-2 form-control' type="text" placeholder="Enter custom title" onChange={(e) => {
            setSearchTerm(e.target.value)
          }} />
          <button className="m-2 btn btn-primary" type="submit">Search</button>
        </form>

        <FileComponent displayedFilesList={displayedFilesList.files} deleteFileFromList={deleteFileFromList} />

      </div>

    </div >
  )
}

export default App