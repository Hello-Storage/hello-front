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

export const unshareFile = async (selectedFile: FileDB | null, type: string): Promise<AxiosResponse | AxiosError | undefined> => {
    let response: AxiosResponse | AxiosError | undefined;
    if (selectedFile) {
        switch (type) {
            case "public":
                //unpublish file and get sharing URL from server
                response = await unpublishFile(selectedFile)
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
    const customToken = localStorage.getItem("customToken")
    const signature = sessionStorage.getItem("personalSignature")

    if (!customToken || !signature) {
        alert("Error: Not logged in!")
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
            metadata: JSON.stringify(metadata),
            fileId: selectedFile.ID,
        },
        {
            headers: {
                Authorization: `Bearer ${customToken}`
            },
        }).then((response: AxiosResponse) => {
            return response;
        }).catch((error: AxiosError) => {
            return error;
        })

    return responseLink;
}

const unpublishFile = async (selectedFile: FileDB): Promise<AxiosError | AxiosResponse | undefined> => {
    const customToken = localStorage.getItem("customToken");
    
    if (!customToken) {
        alert("Error: Not logged in...")
        return;
    }

    //make an axios delete request to /api/v0/unpublish with the ID of the file
    //the response will be a confirmation message
    //update the state accordingly
    
    const response = await axios.delete(`${baseUrl}/api/v0/file/unpublish/${selectedFile.ID}`,
    {
        headers: {
            Authorization: `Bearer ${customToken}`
        },
    }).then((response: AxiosResponse) => {
        return response;
    }).catch((error: AxiosError) => {
        return error;
    })

    return response;
}


export const getFileSharedState = async (fileId: number | undefined): Promise<AxiosResponse | AxiosError | undefined> => {
    const customToken = localStorage.getItem("customToken")
    if (!customToken || !fileId) {
        return Promise.resolve(undefined);
    }

    try {
        const response = await axios.get(`${baseUrl}/api/v0/file/share/states/${fileId}`,
            {
                headers: {
                    Authorization: `Bearer ${customToken}`
                },
            });
        return response;
    } catch (error) {
        return error as AxiosError;
    }
}

export const getPublicMetadata = async (hash: string): Promise<AxiosResponse | AxiosError | undefined> => {
    const customToken = localStorage.getItem("customToken")
    if (!customToken || !hash) {
        return Promise.resolve(undefined);
    }

    try {
        const response = await axios.get(`${baseUrl}/api/v0/file/public/metadata/${hash}`,
            {
                headers: {
                    Authorization: `Bearer ${customToken}`
                },
            });
        return response;
    } catch (error) {
        return error as AxiosError;
    }
}
