import { AxiosError, AxiosResponse } from "axios";

import { Api, File as FileType } from "api";
import { toast } from "react-toastify";

export const shareFile = async (selectedFile: FileType | null, type: string, user: string | undefined): Promise<AxiosResponse | AxiosError | undefined> => {
    let response: AxiosResponse | AxiosError | undefined;
    if (selectedFile) {
        switch (type) {
            case "public":
            case "one-time":
            case "monthly":
                //publish file and get sharing URL from server
                response = await publishFile(selectedFile, `/file/share/custom-type/` + type)
                break;
            case "email":
            case "wallet":
                response = await publishFile(selectedFile, `/file/share/${type}/` + user)
                break;
            default:
                alert("Error: Invalid share type")
                break;
        }
    }
    return response;
}

export const unshareFile = async (selectedFile: FileType | null, type: string): Promise<AxiosResponse | AxiosError | undefined> => {
    let response: AxiosResponse | AxiosError | undefined;
    if (selectedFile) {
        switch (type) {
            case "public":
            case "one-time":
            case "monthly":
                //unpublish file and get sharing URL from server
                response = await unpublishFile(selectedFile)
                break;
            case "email":
                // response = await unpublishEmailSharedFile(selectedFile)
                toast.error("Can't unShare in this method")
                break;
            case "wallet":
                // response = await unpublishWalletSharedFile(selectedFile)
                toast.error("Can't unShare in this method")
                break;
            default:
                alert("Error: Invalid share type")
                break;
        }
    }

    return response;
}


const publishFile = async (selectedShareFile: FileType, apiUrl: string): Promise<AxiosError | AxiosResponse | undefined> => {
    const responseLink = await Api.post(apiUrl, selectedShareFile
    ).then((response: AxiosResponse) => {
        return response;
    }).catch((error: AxiosError) => {
        return error;
    })
    return responseLink;
}

const unpublishFile = async (selectedShareFile: FileType): Promise<AxiosError | AxiosResponse | undefined> => {
    const responseLink = await Api.post(`/file/share/unpublish`, selectedShareFile
    ).then((response: AxiosResponse) => {
        return response;
    }).catch((error: AxiosError) => {
        return error;
    })

    return responseLink;
}

// const unpublishEmailSharedFile = async (selectedShareFile: FileType): Promise<AxiosError | AxiosResponse | undefined> => {

// }

// const unpublishWalletSharedFile = async (selectedShareFile: FileType): Promise<AxiosError | AxiosResponse | undefined> => {

// }



export const getPublishedFile = async (hash: string): Promise<AxiosResponse | AxiosError | undefined> => {
    try {
        const response = await Api.get(`/file/share/published/${hash}`);
        return response;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        toast.error(error.response?.data.error)
    }
}