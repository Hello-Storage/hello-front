import { AppDispatch } from "state";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { logoutUser } from "state/user/actions";
import { decryptContentUtil, decryptFilename, getAesKey } from "utils/encryption/filesCipher";
import { Folder } from "api";
import { toast } from "react-toastify";
import { PreviewImage, setImageViewAction } from "state/mystorage/actions";

function containsSubArray(mainArray: Uint8Array, subArray: Uint8Array): boolean {
    for (let i = 0; i <= mainArray.length - subArray.length; i++) {
        let found = true;
        for (let j = 0; j < subArray.length; j++) {
            if (mainArray[i + j] !== subArray[j]) {
                found = false;
                break;
            }
        }
        if (found) {
            return true;
        }
    }
    return false;
}

function indexOfSubArray(mainArray: Uint8Array, subArray: Uint8Array): number {
    for (let i = 0; i <= mainArray.length - subArray.length; i++) {
        let found = true;
        for (let j = 0; j < subArray.length; j++) {
            if (mainArray[i + j] !== subArray[j]) {
                found = false;
                break;
            }
        }
        if (found) {
            return i;
        }
    }
    return -1; // Return -1 if the subArray is not found
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB


export const downloadMultipartFolder = async (folder: Folder, dispatch: AppDispatch, personalSignature: string) => {
    console.log("folder:")
    console.log(folder);
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT + `/folder/download/multipart/${folder.uid}`;
    if (!localStorage.getItem("access_token")) {
        logoutUser();
    }

    const response = await fetch(apiEndpoint, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token"),
        }
    });

    if (!response.ok || !response.body) {
        logoutUser();
        throw new Error(`An error has occurred: ${response.status}`);
    }

    const reader = response.body.getReader();
    let partBuffer = new Uint8Array();
    let currentFileBuffer = new Uint8Array();
    let currentFileInfo = null;
    let boundary = null;

    dispatch(setUploadStatusAction({
        info: "Downloading...",
        uploading: true,
        size: 0, // Size is unknown in this case
    }));

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Accumulate the received value into the partBuffer
        const tempBuffer = new Uint8Array(partBuffer.length + value.length);
        tempBuffer.set(partBuffer, 0);
        tempBuffer.set(value, partBuffer.length);
        partBuffer = tempBuffer;

        // Process the accumulated partBuffer
        // Check for boundary only if it's known
        const encodedBoundary = new TextEncoder().encode("--" + boundary);
        while ((boundary === null || containsSubArray(partBuffer, encodedBoundary)) && partBuffer.length > 0) {
            // Find the boundary if not already found
            if (!boundary) {
                const boundaryMatch = /--(\S+)/.exec(new TextDecoder().decode(partBuffer));
                if (boundaryMatch) {
                    boundary = boundaryMatch[1];
                    partBuffer = partBuffer.slice(boundaryMatch[0].length); // Remove boundary from buffer
                }
            }

            // Find end of headers
            const doubleNewLine = new TextEncoder().encode("\r\n\r\n");
            const headerEndIndex = partBuffer.findIndex((element, index, array) => {
                return array.slice(index, index + 4).every((value, idx) => value === doubleNewLine[idx]);
            });

            if (headerEndIndex !== -1) {
                const headersPart = new TextDecoder().decode(partBuffer.slice(0, headerEndIndex));
                const contentDispositionMatch = /Content-Disposition: attachment; filename="?([^"]+)"?/.exec(headersPart);
                let fileName = contentDispositionMatch ? contentDispositionMatch[1] : "";
                if (fileName !== "") {
                    const decryptedFilename = await decryptFilename(fileName, personalSignature);
                    if (decryptedFilename) {
                        fileName = decryptedFilename;
                    }
                } else {
                    fileName = folder.title;
                }

                if (currentFileInfo && currentFileInfo.fileName !== fileName) {
                    console.log(`Processing file ${currentFileInfo.fileName}, Size: ${currentFileBuffer.length}`);
                    // New file, process the accumulated currentFileBuffer
                    processDownloadedFile(currentFileBuffer, currentFileInfo, dispatch);
                    currentFileBuffer = new Uint8Array();
                }

                currentFileInfo = { fileName };
                partBuffer = partBuffer.slice(headerEndIndex + 4); // Skip past headers

            }

            // Find end of file part
            const encodedBoundary = new TextEncoder().encode("\r\n--" + boundary);
            const nextBoundaryIndex = indexOfSubArray(partBuffer, encodedBoundary);

            if (nextBoundaryIndex !== -1) {
                // Accumulate the file part into currentFileBuffer
                // Slice out the file part just before the boundary starts
                const filePart = partBuffer.slice(0, nextBoundaryIndex);
                console.log(`filePart Size: ${filePart.length}`)
                currentFileBuffer = new Uint8Array([...currentFileBuffer, ...filePart]);
                console.log(`currentFileBuffer Size after adding filePart: ${currentFileBuffer.length}`)

                partBuffer = partBuffer.slice(nextBoundaryIndex + encodedBoundary.length); // Skip past file part
            } else {
                // If the next boundary is not found, accumulate the whole partBuffer into currentFileBuffer
                currentFileBuffer = new Uint8Array([...currentFileBuffer, ...partBuffer]);
                partBuffer = new Uint8Array();
            }
            console.log(`partBuffer Size after processing: ${partBuffer.length}`)
        }
    }

    // Process the last file
    if (currentFileInfo) {
        processDownloadedFile(currentFileBuffer, currentFileInfo, dispatch);
    }

    dispatch(setUploadStatusAction({
        info: "Finished downloading data",
        uploading: false,
    }));
};

const processDownloadedFile = (fileBuffer: Uint8Array, fileInfo: { fileName: string }, dispatch: AppDispatch) => {
    // TODO: Add decryption if needed
    const blob = new Blob([fileBuffer], { type: "application/octet-stream" });
    console.log("fileBuffer length:")
    console.log(fileInfo)
    triggerDownload(blob, fileInfo.fileName);
    dispatch(setUploadStatusAction({
        info: `Downloaded ${fileInfo.fileName}`,
        uploading: false,
    }));
};

const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    toast.success(`Download complete: ${filename}`);
    window.URL.revokeObjectURL(url);
};