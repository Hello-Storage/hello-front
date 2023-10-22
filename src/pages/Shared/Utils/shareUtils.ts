import { AxiosError, AxiosResponse } from "axios";

import { Api, File as FileType, RootResponse } from "api";

export const shareFile = async (selectedFile: FileType | null, type: string): Promise<AxiosResponse | AxiosError | undefined> => {
    let response: AxiosResponse | AxiosError | undefined;
    if (selectedFile) {
        switch (type) {
            case "public":
                //publish file and get sharing URL from server
                response = await publishFile(selectedFile)
                break;
            case "one-time":
                //response = await requestFileOneTime(selectedFile, true)
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

export const unshareFile = async (selectedFile: FileType | null, type: string): Promise<AxiosResponse | AxiosError | undefined> => {
    let response: AxiosResponse | AxiosError | undefined;
    if (selectedFile) {
        switch (type) {
            case "public":
                //unpublish file and get sharing URL from server
                response = await unpublishFile(selectedFile)
                break;
            case "one-time":
                //response = await requestFileOneTime(selectedFile, false)
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


const publishFile = async (selectedShareFile: FileType): Promise<AxiosError | AxiosResponse | undefined> => {
    const responseLink = await Api.post(`/file/share/publish`, selectedShareFile
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


export const getPublishedFile = async (hash: string): Promise<AxiosResponse | AxiosError | undefined> => {
    try {
        const response = await Api.get(`/file/share/published/${hash}`);
        return response;
    } catch (error) {
        return error as AxiosError;
    }
}