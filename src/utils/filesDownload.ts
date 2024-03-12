import { AppDispatch } from "state";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { logoutUser } from "state/user/actions";
import { decryptContentUtil, getAesKey } from "utils/encryption/filesCipher";
import { File as FileType } from "api";
import { PreviewImage, setImageViewAction } from "state/mystorage/actions";
import { toast } from "react-toastify";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export const downloadMultipart = async (file: FileType, dispatch: AppDispatch) => {
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT + `/file/download/multipart/${file.uid}`;
    if (!localStorage.getItem("access_token")) {
        logoutUser();
    }

    const response = await fetch(apiEndpoint, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Authorization": "Bearer " + localStorage.getItem("access_token"),
        }
    });
    let encrypted = false;
    if (file.encryption_status === "encrypted") {
        encrypted = true;
    }
    dispatch(
        setUploadStatusAction({
            info: encrypted ? "Decrypting..." : "Downloading...",
            uploading: true,
            size: file.size,
        }))
    const stream = new ReadableStream({
        async pull(controller) {
            if (!response.ok || !response.body) {
                logoutUser();
                const message = `An error has occured: ${response.status}`;
                throw new Error(message);
            }
            const reader = response.body.getReader();
            let isFirstChunk = true;
            let aesKey: CryptoKey | undefined;
            let iv, accumulated = new Uint8Array();
            let totalProcessed = 0; // Variable to track the total processed data


            const shouldContinue = true;
            while (shouldContinue) {

                const { done, value } = await reader.read();
                if (done) break;


                // Append new data to the accumulated buffer
                const tempBuffer = new Uint8Array(accumulated.length + value.length);

                tempBuffer.set(accumulated);
                tempBuffer.set(value, accumulated.length);
                accumulated = tempBuffer;


                // Process first chunk separately
                if (isFirstChunk) {
                    if (accumulated.length >= 28) {
                        const salt = accumulated.slice(0, 16);
                        iv = accumulated.slice(16, 28);
                        if (encrypted) {
                            const keyInfo = await getAesKey(file.cid_original_encrypted, ['decrypt'], salt, iv);
                            aesKey = keyInfo.aesKey;
                        }
                        isFirstChunk = false;
                        accumulated = accumulated.slice(28);
                    }
                }

                // Decrypt when we have enough data or it's the last chunk
                while (accumulated.length >= CHUNK_SIZE) {
                    const chunk = accumulated.slice(0, CHUNK_SIZE);
                    accumulated = accumulated.slice(CHUNK_SIZE);

                    // Decrypt the chunk
                    if (encrypted) {
                        if (aesKey && iv) {
                            const decryptedChunk = await decryptContentUtil(chunk, aesKey, iv);
                            controller.enqueue(new Uint8Array(decryptedChunk));
                        }
                    } else {
                        controller.enqueue(chunk);
                    }
                    totalProcessed += CHUNK_SIZE; // Update total processed data

                }
                dispatch(
                    setUploadStatusAction({
                        read: totalProcessed,
                    }))
            }

            // Enqueue any remaining data
            if (accumulated.length > 0) {
                if (encrypted) {
                    if (aesKey && iv) {
                        const decryptedChunk = await decryptContentUtil(accumulated, aesKey, iv);
                        controller.enqueue(new Uint8Array(decryptedChunk));
                    } else {
                        controller.enqueue(accumulated);
                    }
                }
            }

            controller.close();
        }
    });

    // Create blob for download
    const responseBlob = new Response(stream);
    return new Blob([await responseBlob.blob()], { type: file.mime_type });
};



export const triggerDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    toast.success("Download complete!");
    window.URL.revokeObjectURL(url);
};



export const viewMultipart = async (file: FileType, dispatch: AppDispatch) => {
    const apiEndpoint = import.meta.env.VITE_API_ENDPOINT + `/file/download/multipart/${file.uid}`;
    if (!localStorage.getItem("access_token")) {
        logoutUser();
    }


    const response = await fetch(apiEndpoint, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Authorization": "Bearer " + localStorage.getItem("access_token"),
        }
    });
    let encrypted = false;
    if (file.encryption_status === "encrypted") {
        encrypted = true;
    }
    dispatch(
        setUploadStatusAction({
            info: encrypted ? "Decrypting..." : "Downloading...",
            uploading: true,
            size: file.size,
        }))
    const stream = new ReadableStream({
        async pull(controller) {
            if (!response.ok || !response.body) {
                logoutUser();
                const message = `An error has occured: ${response.status}`;
                throw new Error(message);
            }
            const reader = response.body.getReader();
            let isFirstChunk = true;
            let aesKey: CryptoKey | undefined;
            let iv, accumulated = new Uint8Array();
            let totalProcessed = 0; // Variable to track the total processed data


            const shouldContinue = true;
            while (shouldContinue) {

                const { done, value } = await reader.read();
                if (done) break;


                // Append new data to the accumulated buffer
                const tempBuffer = new Uint8Array(accumulated.length + value.length);

                tempBuffer.set(accumulated);
                tempBuffer.set(value, accumulated.length);
                accumulated = tempBuffer;


                // Process first chunk separately
                if (isFirstChunk) {
                    if (accumulated.length >= 28) {
                        const salt = accumulated.slice(0, 16);
                        iv = accumulated.slice(16, 28);
                        if (encrypted) {
                            const keyInfo = await getAesKey(file.cid_original_encrypted, ['decrypt'], salt, iv);
                            aesKey = keyInfo.aesKey;
                        }
                        isFirstChunk = false;
                        accumulated = accumulated.slice(28);
                    }
                }

                // Decrypt when we have enough data or it's the last chunk
                while (accumulated.length >= CHUNK_SIZE) {
                    const chunk = accumulated.slice(0, CHUNK_SIZE);
                    accumulated = accumulated.slice(CHUNK_SIZE);

                    // Decrypt the chunk
                    if (encrypted) {
                        if (aesKey && iv) {
                            const decryptedChunk = await decryptContentUtil(chunk, aesKey, iv);
                            controller.enqueue(new Uint8Array(decryptedChunk));
                        }
                    } else {
                        controller.enqueue(chunk);
                    }
                    totalProcessed += CHUNK_SIZE; // Update total processed data

                }
                dispatch(
                    setUploadStatusAction({
                        read: totalProcessed,
                    }))
            }

            // Enqueue any remaining data
            if (accumulated.length > 0) {
                if (encrypted) {
                    if (aesKey && iv) {
                        const decryptedChunk = await decryptContentUtil(accumulated, aesKey, iv);
                        controller.enqueue(new Uint8Array(decryptedChunk));
                    } else {
                        controller.enqueue(accumulated);
                    }
                }
            }

            controller.close();
        }
    });

    // Create blob for download
    const responseBlob = new Response(stream);
    const blob = new Blob([await responseBlob.blob()], { type: file.mime_type });
    dispatch(
        setUploadStatusAction({
            info: "Finished downloading data",
            uploading: false,
        })
    );

    if (!blob) {
        console.error("Error downloading file:", file);
        return;
    }
    const url = window.URL.createObjectURL(blob);

    let mediaItem: PreviewImage;
    if (file.mime_type.startsWith("video/")) {
        mediaItem = {
            type: "video",
            src: url,
            alt: file.name,
        };
    } else if (
        file.mime_type === "application/pdf" ||
        file.mime_type === "text/plain"
    ) {
        window.open(url, "_blank"); // PDF or TXT in a new tab
        return;
    } else {
        mediaItem = {
            src: url,
            alt: file.name,
        };
    }

    dispatch(setImageViewAction({ img: mediaItem, show: true }));


};



// export const downloadSingle=(file:FileType)=>{
//     // TODO centralize download logic for tiny files
//     return "coming soon"
// }