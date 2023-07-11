import axios, { AxiosError, AxiosResponse } from "axios";
import { FileDB } from "../types";
import { baseUrl } from "../constants";
import { decryptContent, getHashFromSignature, getKeyFromHash } from "../helpers/cipher";


export const shareFile = async (selectedFile: FileDB | null, type: string): Promise<AxiosResponse | AxiosError | undefined>  => {
    let response: AxiosResponse | AxiosError | undefined;
    if (selectedFile) {
        switch (type) {
            case "public":
                //publish file and get sharing URL from server
                response = await publishFile(selectedFile)
                break;
            case "one-time":
                console.log(type)
                break;
            case "address-restricted":
                console.log(type)
                break;
            case "password-restricted":
                console.log(type)
                break;
            case "time-restricted":
                console.log(type)
                break;
            case "subscription":
                console.log(type)
                break;
            default:
                alert("Error: Invalid share type")
                break;
        }
    }

    return response;
}

const publishFile = async (selectedFile: FileDB): Promise<AxiosError | AxiosResponse | undefined> => {
    console.log(selectedFile)
    const customToken = localStorage.getItem("customToken")
    const signature = sessionStorage.getItem("personalSignature")

    if (!customToken || !signature) {
        alert("Error: Not logged in")
        return;
    }

    const hash = await getHashFromSignature(signature)
    const key = await getKeyFromHash(hash)

    //get cidEncryptedOriginalStr, cidOfEncryptedBuffer and metadata from selectedFile
    const { cidEncryptedOriginalStr, cidOfEncryptedBuffer, metadata, iv } = selectedFile

    //make an axios post request to /api/v0/publish with cidEncryptedOriginalStr, cidOfEncryptedBuffer and the unencrypted metadata
    //the response will be the sharing URL
    //set the sharing URL in the store

    const cidEncryptedOriginalBytes = Uint8Array.from(atob(cidEncryptedOriginalStr), c => c.charCodeAt(0))

    const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0))
    if (!cidOfEncryptedBuffer || !cidEncryptedOriginalBytes || !ivBytes || !metadata) {
        alert("Error: Invalid file")
        return;
    }

    const cidOriginalBuffer: ArrayBuffer = await decryptContent(ivBytes, key, cidEncryptedOriginalBytes)

    //transform cidOriginalBuffer to a string
    const cidOriginalStr = new TextDecoder().decode(cidOriginalBuffer)

    const responseLink = await axios.post(`${baseUrl}/api/v0/file/publish`,
        {
            cidOriginalStr: cidOriginalStr,
            cidOfEncryptedBuffer: cidOfEncryptedBuffer,
            metadata: JSON.stringify(metadata)
        },
        {
            headers: {
                Authorization: `Bearer ${customToken}`
            },
        }).then((response: AxiosResponse) => {
            console.log("response")
            return response;
        }).catch((error: AxiosError) => {
            console.log("error")
            return error;
        })

    return responseLink;
}