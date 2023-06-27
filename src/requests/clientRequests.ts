import axios, { AxiosResponse } from "axios"
import { FileDB, FileUploadResponse } from "../types";
import { baseUrl } from "../constants";
import { encryptBuffer, encryptFileBuffer, encryptFileMetadata, getHashFromSignature, getKeyFromHash } from "../helpers/cipher";



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

export const downloadFile = (file: FileDB) => {
  const cid = file.cid;
  if (!cid) {
    return;
  }
  const customToken = localStorage.getItem("customToken");

  axios.get(`${baseUrl}/api/file/${cid}`, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
    responseType: 'blob', // set response type as blob to handle binary data
  }).then((response) => {
    console.log(response)
    // Create a new Blob object with the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] });

    // Create an object URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a link and programmatically 'click' it to initiate the download
    const link = document.createElement('a');
    link.href = url;
    const filename = response.headers['original-filename'];

    link.setAttribute('download', filename); // or any other filename you want
    link.click();

    // For better performance, revoke the object URL after the download
    window.URL.revokeObjectURL(url);
  }).catch((error) => {
    console.log(error);
    return null
  });
}

export const uploadFile = async (file: File): Promise<AxiosResponse<FileUploadResponse> | null> => {
  const customToken = localStorage.getItem("customToken");

  const signature = sessionStorage.getItem("personalSignature");

  const hash = await getHashFromSignature(signature!);

  const key = await getKeyFromHash(hash);

  //encrypt file
  const { encryptedMetadataBuffer, iv } = await encryptFileMetadata(file, key);

  console.log(file)

  //get the CID of the encrypted file, get the key used to encrypt the file (cidKey), and the encrypted file buffer
  const { cidOfEncryptedBufferStr, cidStr, encryptedFileBuffer } = await encryptFileBuffer(file);

  //transform cidOfEncryptedBufferStr to Uint8Array
  let cidBuffer = new TextEncoder().encode(cidStr);
  //transform encryptedMetadataBuffer to string
  let encryptedMetadataStr = new TextDecoder().decode(encryptedMetadataBuffer);


  //encrypt cidOfEncryptedBufferStr and cidStr with key
  let cidEncrypted = await encryptBuffer(cidBuffer, key, iv);
  //transform encryptedCidSigned to string
  let cidEncryptedOriginalStr = new TextDecoder().decode(cidEncrypted);

  const encryptedFileBlob = new Blob([encryptedFileBuffer]);






  //Transform iv so that formData can append it
  const ivString = JSON.stringify(iv);




  //To reverse and get original CryptoKey:

  /*
// Convert the base64-encoded string back to a Uint8Array
const cidKeyArray = Uint8Array.from(atob(cidKeyBase64), c => c.charCodeAt(0));

// Import the key back into a CryptoKey
const cidKey = await crypto.subtle.importKey("raw", cidKeyArray, { name: "AES-CBC", length: 256 }, false, ["encrypt", "decrypt"]);
  */

/*
  console.log("encryptedMetadataStr:")
  console.log(encryptedMetadataStr)
  console.log("encryptedFileBlob:")
  console.log(encryptedFileBlob)
  console.log("ivString:")
  console.log(ivString)
  console.log("cidOfEncryptedBufferStr:")
  console.log(cidOfEncryptedBufferStr)
  console.log("cidEncryptedOriginalStr:")
  console.log(cidEncryptedOriginalStr)
*/

  const formData = new FormData();
  formData.append("encryptedFileBlob", encryptedFileBlob);
  formData.append("encryptedMetadataStr", encryptedMetadataStr);
  formData.append("ivString", ivString);
  formData.append("cidOfEncryptedBufferStr", cidOfEncryptedBufferStr);
  formData.append("cidEncryptedOriginalStr", cidEncryptedOriginalStr);
  return axios.post(`${baseUrl}/api/file/upload`, formData, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
  }).then((response) => {


    return response
  }
  ).catch((error) => {
    console.log(error);
    return null
  }
  );
}

export const savePassword = async (password: string): Promise<AxiosResponse | null> => {
  const customToken = localStorage.getItem("customToken");
  return axios.post(`${baseUrl}/api/password`, { password: password }, {
    headers: {
      Authorization: `Bearer ${customToken}`,
    },
  }).then((response) => {
    console.log(response);
    return response
  }).catch((error) => {
    console.log(error);
    return error;
  });


}