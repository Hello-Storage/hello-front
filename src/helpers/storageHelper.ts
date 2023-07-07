import axios from "axios";
import { decryptContent, getHashFromSignature, getKeyFromHash } from "./cipher";
import { baseUrl } from "../constants";
import { FileDB } from "../types";

export const decryptMetadata = async (encryptedMetadata: string, ivStr: string, key: CryptoKey) => {
  //decrypt metadata

  const encryptedMetadataBytes = Uint8Array.from(
    atob(encryptedMetadata),
    (c) => c.charCodeAt(0)
  )

  const iv = Uint8Array.from(atob(ivStr), (c) => c.charCodeAt(0))

  //deecrypt the metadata
  const metadataBuffer = await decryptContent(
    iv,
    key,
    encryptedMetadataBytes
  )

  //transform metadata from ArrayBuffer to string
  const decoder = new TextDecoder()
  const metadataString = decoder.decode(metadataBuffer)

  //transform metadata from string to JSON Object
  const metadata = JSON.parse(metadataString)

  return metadata
}

export const formatByteWeight = (weight: number): string => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  const TB = GB * 1024;

  let size: string;
  switch (true) {
    case weight >= TB:
      size = `${(weight / TB).toFixed(2)} TB`;
      break;
    case weight >= GB:
      size = `${(weight / GB).toFixed(2)} GB`;
      break;
    case weight >= MB:
      size = `${(weight / MB).toFixed(2)} MB`;
      break;
    case weight >= KB:
      size = `${(weight / KB).toFixed(2)} KB`;
      break;
    default:
      size = `${weight} B`;
  }

  console.log("File Size:", size);
  return size;
}

export const getDecryptedFilesList = async (customToken: string | null): Promise<FileDB[] | undefined> => {
  try {
    //get files list from /api/files with auth header "Bearer customToken"
    const response = await axios
      .get(`${baseUrl}/api/files`, {
        headers: {
          Authorization: `Bearer ${customToken}`,
        },
      })
    const filesList: FileDB[] = await response.data.files;

    const signature = sessionStorage.getItem("personalSignature");

    if (!signature) {
      return;
    }

    const hash = await getHashFromSignature(signature);
    const key = await getKeyFromHash(hash);
    //iterate through filesList and decrypt metadata
    const decryptedFiles = await Promise.all(
      filesList.map(async (file: FileDB) => {
        //decrypt metadata
        const metadata = await decryptMetadata(file.encryptedMetadata, file.iv, key);
        //set metadata
        file.metadata = metadata;
        return file;
      })
    );

    return decryptedFiles;

  } catch (error) {
    console.log(error);
    throw error;
  }

}