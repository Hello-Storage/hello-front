import './App.css'
import { FormEvent, useEffect, useState } from 'react'
import ConnectWalletButton from './components/ConnectWalletButton'
import axios from 'axios'
import FileComponent from './components/FileComponent'
import { FileDB } from './types'
import Toast from './components/Toast'
import { baseUrl } from './constants'
import PasswordModal from './components/PasswordModal'

function App() {


  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [ref, setRef] = useState<HTMLInputElement | null>(null)
  const [fileToUplad, setFileToUpload] = useState<File | null>(null)
  const [customToken, setCustomToken] = useState<string | null>(localStorage.getItem("customToken"));
  const [filesList, setFilesList] = useState<{ files: FileDB[] }>({ files: [] });
  const [displayedFilesList, setDisplayedFilesList] = useState<{ files: FileDB[] }>({ files: [] });
  const [searchTerm, setSearchTerm] = useState("")
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");


  const closePasswordModal = () => {
    setShowPasswordModal(!showPasswordModal)
  }
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
    }).then((response: { data: { files: FileDB } }) => {
      console.log(response)

      setFileToUpload(null)
      //update files list
      const file: FileDB = response.data.files

      filesList.files.push(file)

      setFilesList({ ...filesList, files: filesList.files })
      setDisplayedFilesList({ ...displayedFilesList, files: filesList.files }) // set displayed files list as well

      setToastMessage("File uploaded successfully")
      setShowToast(true);

    }
    ).catch((error) => {
      console.log(error)
    }
    )



  }, [displayedFilesList, fileToUplad, filesList, filesList.files])


  const onPressConnect = async () => {
    setLoading(true)
    setShowPasswordModal(true)
  }

  const onPressLogout = () => {
    setAddress(null);
    localStorage.removeItem("customToken");
    sessionStorage.removeItem("signingKey");
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
      const updatedFilesList = displayedFilesList.files.filter((item: FileDB) => item.ID !== file.ID);
      setFilesList({ ...filesList, files: updatedFilesList });
      setDisplayedFilesList({ ...displayedFilesList, files: updatedFilesList });
    }
  }

  useEffect(() => {
    //get files list from /api/files with auth header "Bearer customToken"
    const customToken = localStorage.getItem("customToken");
    if (!customToken) {
      return
    }
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
    <div id="App">
      {/*make h1 on top of everything*/}
      <Toast toastState={[showToast, setShowToast]} message={toastMessage} />
      <ConnectWalletButton
        onPressConnect={onPressConnect}
        onPressLogout={onPressLogout}
        loading={loading}
        address={address}
        customToken={customToken}
      />

      <PasswordModal
        showPasswordModal={showPasswordModal}
        closePasswordModal={closePasswordModal}
        setAddress={setAddress}
        setLoading={setLoading}
        setToastMessage={setToastMessage}
        setShowToast={setShowToast}
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

      <div className="container mt-4">
        <button onClick={onUploadFilePress} className="btn btn-primary mb-4">Upload file</button>
        <h3>Your uploaded files:</h3>
        <form className="d-flex mb-4" onSubmit={(e: FormEvent<HTMLFormElement>) => handleSubmit(e)}>
          <input className='form-control' type="text" placeholder="Enter custom title" onChange={(e) => {
            setSearchTerm(e.target.value)
          }} />
          <button className="btn btn-secondary ms-2" type="submit">Search</button>
        </form>

        <FileComponent displayedFilesList={displayedFilesList.files} deleteFileFromList={deleteFileFromList} />

      </div>
    </div>
  )
}

export default App