import axios, { AxiosError, AxiosResponse } from "axios"
import { FileDB, FileMetadata, FileUploadResponseWithTime, PublishedFile } from "../types";
import { baseUrl } from "../constants";
import { getHashFromSignature } from "../helpers/encryption/cipher";
import { removeCustomToken, setAddress } from "../features/account/accountSlice";
import { isSignedIn } from "../helpers/userHelper";
import { NavigateFunction } from "react-router-dom";
import { Dispatch } from "@reduxjs/toolkit";
import { decryptContent, decryptFileBuffer, encryptBuffer, encryptFileBuffer, encryptMetadata } from "../helpers/encryption/filesCipher";



export const deleteFile = async (file: FileDB | null): Promise<AxiosResponse | null> => {
  const customToken = localStorage.getItem("customToken");

  const fileId = file?.ID;
  if (!fileId) {
    return Promise.resolve(null);
  }
  return axios.delete(`${baseUrl}/api/file/${fileId}`, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
  }).then((response) => {
    console.log(response);
    return response
  }).catch((error) => {
    console.log(error);
    return null
  });
}

export const downloadFile = async (file: FileDB, type: string) => {
  const cidOfEncryptedBuffer = file.cidOfEncryptedBuffer;
  let fileMetadata: FileMetadata | null = null;
  const cidEncryptedOriginalStr = file.cidEncryptedOriginalStr;




  const signature = sessionStorage.getItem("personalSignature")

  if (!signature) {
    return;
  }


  let cidOriginalBuffer: ArrayBuffer | undefined;
  if (type === "original") {
    fileMetadata = file.metadata;
    const cidEncryptedOriginalBytes = Uint8Array.from(atob(cidEncryptedOriginalStr), c => c.charCodeAt(0))

    if (!cidOfEncryptedBuffer || !fileMetadata) {
      return;
    }
    cidOriginalBuffer = await decryptContent(cidEncryptedOriginalBytes, signature)
  } else if (type === "public") {
    fileMetadata = file.metadata
    cidOriginalBuffer = new TextEncoder().encode(file.cidOriginalStr);
  }

  if (!cidOriginalBuffer || fileMetadata === null) {
    return;
  }
  const customToken = localStorage.getItem("customToken");

  axios.get(`${baseUrl}/api/file/${cidOfEncryptedBuffer}`, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
    responseType: 'arraybuffer', // set response type as blob to handle binary data
  }).then(async (response) => {
    if (fileMetadata === null) return;
    console.log(response)

    const decoder = new TextDecoder()
    const cidOriginalStr = decoder.decode(cidOriginalBuffer)


    const decryptedFileBuffer = await decryptFileBuffer(response.data, cidOriginalStr).catch((error) => {
      console.log("Error decrypting:")
      console.log(error);
      return null
    });
    if (!decryptedFileBuffer) {
      return;
    }
    const decryptedFile = new File([decryptedFileBuffer], fileMetadata.name, { type: fileMetadata.type })
    console.log("decryptedFile:")
    console.log(decryptedFile)

    if (!decryptedFile) {
      return;
    }

    // Create an object URL for the Blob
    const url = window.URL.createObjectURL(decryptedFile);

    // Create a link and programmatically 'click' it to initiate the download
    const link = document.createElement('a');
    link.href = url;
    const filename = fileMetadata.name;

    link.setAttribute('download', filename); // or any other filename you want
    link.click();

    // For better performance, revoke the object URL after the download
    window.URL.revokeObjectURL(url);
  }).catch((error) => {
    console.log(error);
    return null
  });
}

export const getDataCap = async (address: string): Promise<number | Error> => {
  const dataCap = axios.get(`${baseUrl}/api/storage/datacap/get/${address}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("customToken")}`,
    },
  }).then((response) => {
    return response.data
  }).catch((error: Error) => {
    console.log(error);
    return error;
  });

  return dataCap;
}

export const getUsedStorage = async (address: string): Promise<number | Error> => {
  const usedStorage = axios.get(`${baseUrl}/api/storage/used/get/${address}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("customToken")}`,
    },
  }).then((response) => {
    return response.data
  }).catch((error: Error) => {
    console.log(error);
    return error;
  });

  return usedStorage;
}

export const getUploadedFilesCount = async (address: string): Promise<number | Error> => {
  const uploadedFilesCount = axios.get(`${baseUrl}/api/storage/uploaded/count/get/${address}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("customToken")}`,
    },
  }).then((response) => {
    return response.data
  }).catch((error: Error) => {
    console.log(error);
    return 0;
  });
  return uploadedFilesCount;
}

export const viewFile = async (file: FileDB, type: string) => {
  const cidOfEncryptedBuffer = file.cidOfEncryptedBuffer;
  const fileMetadata = file.metadata;




  const signature = sessionStorage.getItem("personalSignature")

  if (!signature) {
    return;
  }

  let cidOriginalBuffer: ArrayBuffer | undefined;

  if (type === "original") {
    const cidEncryptedOriginalStr = (file as FileDB).cidEncryptedOriginalStr;
    const cidEncryptedOriginalBytes = Uint8Array.from(atob(cidEncryptedOriginalStr), c => c.charCodeAt(0))

    if (!cidOfEncryptedBuffer || !fileMetadata) {
      return;
    }

    cidOriginalBuffer = await decryptContent(cidEncryptedOriginalBytes, signature)
  } else if (type === "public") {
    const cidOriginalStr = (file as unknown as PublishedFile).cidOriginalStr;
    cidOriginalBuffer = new TextEncoder().encode(cidOriginalStr);
  }

  const customToken = localStorage.getItem("customToken");

  axios.get(`${baseUrl}/api/file/${cidOfEncryptedBuffer}`, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
    responseType: 'arraybuffer', // set response type as blob to handle binary data
  }).then(async (response) => {
    console.log(response)

    if (!cidOfEncryptedBuffer || !fileMetadata) {
      return;
    }

    const decoder = new TextDecoder()
    const cidOriginalStr = decoder.decode(cidOriginalBuffer)



    const decryptedFileBuffer = await decryptFileBuffer(response.data, cidOriginalStr).catch((error) => {
      console.log("Error decrypting:")
      console.log(error);
      return null
    });
    if (!decryptedFileBuffer) {
      return;
    }
    const decryptedFile = new File([decryptedFileBuffer], fileMetadata.name, { type: fileMetadata.type })
    console.log("decryptedFile:")
    console.log(decryptedFile)

    if (!decryptedFile) {
      return;
    }

    //get blob from decrypted file
    const blob = new Blob([decryptedFile], { type: fileMetadata.type });

    if (!blob) { return }

    // Create an object URL for the Blob
    const url = window.URL.createObjectURL(blob);



    window.open(url, '_blank')

    // Create a link and programmatically 'click' it to initiate the download
    const link = document.createElement('video');
    const filename = fileMetadata.name;

    link.setAttribute('download', filename); // or any other filename you want

    // For better performance, revoke the object URL after the download



  }).catch((error) => {
    //TODO: LOGOUT
    console.log(error);
    return "Session expired. Please login again."
  });
}
/*
const updateUploadProgress = (progress: number) => {
      setUploadProgress(progress);
    };*/

export const uploadFile = async (file: File, updateUploadProgress: { (progress: number): void; (arg0: number): void; }):
  Promise<FileUploadResponseWithTime | null> => {
  const customToken = localStorage.getItem("customToken");

  const signature = sessionStorage.getItem("personalSignature");

  if (!signature) {
    return null;
  }

  //encrypt file
  const encryptedMetadataBuffer = await encryptMetadata(file, signature);

  console.log(file)

  //get the CID of the encrypted file, get the key used to encrypt the file (cidKey), and the encrypted file buffer
  const fileArrayBuffer = await file.arrayBuffer();
  const { cidOfEncryptedBufferStr, cidStr, encryptedFileBuffer, encryptionTime } = await encryptFileBuffer(fileArrayBuffer);



  //transform cidOfEncryptedBufferStr to Uint8Array
  const cidBuffer = new TextEncoder().encode(cidStr);
  //transform encryptedMetadataBuffer to string
  const encryptedMetadataStr = btoa(String.fromCharCode(...encryptedMetadataBuffer));

  //encrypt cidOfEncryptedBufferStr and cidStr with key
  const cidEncryptedOriginalBuffer = await encryptBuffer(cidBuffer, signature)
  //transform encryptedCidSigned to string
  const cidEncryptedOriginalStr = btoa(String.fromCharCode(...cidEncryptedOriginalBuffer));
  const encryptedFileBlob = new Blob([encryptedFileBuffer]);


  const formData = new FormData();
  formData.append("encryptedFileBlob", encryptedFileBlob);
  formData.append("encryptedMetadataStr", encryptedMetadataStr);
  formData.append("cidOfEncryptedBufferStr", cidOfEncryptedBufferStr);
  formData.append("cidEncryptedOriginalStr", cidEncryptedOriginalStr);
  return axios.post(`${baseUrl}/api/file/upload`, formData, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;

      updateUploadProgress(percentCompleted)
    },
  }).then((response) => {
    return { response: response, encryptionTime: encryptionTime }
  }
  ).catch((error) => {
    console.log(error);
    return null
  }
  );
}

export const savePersonalSignature = async (personalSignature: string): Promise<AxiosResponse | AxiosError> => {
  const customToken = localStorage.getItem("customToken");
  //hash the personalSignature
  const personalSignatureClientHash = await getHashFromSignature(personalSignature);
  //transform the hash to a string
  const personalSignatureClientHashStr = btoa(String.fromCharCode(...new Uint8Array(personalSignatureClientHash)));

  return axios.post(`${baseUrl}/api/personalSignature`, { personalSignatureClientHash: personalSignatureClientHashStr }, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
  }).then((response) => {
    console.log(response);
    return response
  }).catch((error: AxiosError) => {
    console.log(error);
    return error;
  });


}

export const logOut = async (navigate: NavigateFunction, dispatch: Dispatch, currentPage: string) => {
  if (!isSignedIn(navigate, currentPage)) {
    return;
  }
  //go to /login if no customToken
  dispatch(setAddress(null));
  dispatch(removeCustomToken())
  sessionStorage.removeItem("personalSignature");
  //redirect to login
  location.pathname !== "/login" && location.pathname !== "/register"
    ? navigate(`/login/${currentPage}`)
    : console.log("already on login page");

  return;

}