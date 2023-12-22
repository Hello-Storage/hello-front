import { AppDispatch } from "state";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { logoutUser } from "state/user/actions";
import { decryptFileBuffer, decryptFilePath, decryptFilename, decryptMetadata, getAesKey, handleEncryptedFiles, hexToBuffer } from "utils/encryption/filesCipher";
import { Api, EncryptionStatus, File as FileType, Folder } from "api";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { downloadMultipart } from "./filesDownload";

const MULTIPART_THRESHOLD = import.meta.env.VITE_MULTIPART_THRESHOLD || 1073741824; // 1GiB or 10000 bytes

export const folderDownload = async (personalSignature: string, folder: Folder, dispatch: AppDispatch) => {
    const zipMultipart = new JSZip();
    const zip = new JSZip();
    let filesList: FileType[] = [];
    //make an Api  request to get list of files of a folder
    const res = await Api.get(`/folder/files/${folder.uid}`)
        .catch((err) => {
            console.error("Error downloading folder:", err);
        })

    if (!res) {
        return;
    }

    filesList = res.data.files;

    console.log("filesList", filesList)

    //iterate through the files and decrypt them
    const decryptedFiles = await handleEncryptedFiles(
        filesList,
        personalSignature,
    );

    console.log("decryptedFiles", decryptedFiles)

    if (!decryptedFiles) {
        return;
    }

    for (const file of decryptedFiles) {
        if (file.size > MULTIPART_THRESHOLD) {
            const fileDataBlob = await downloadMultipart(file, dispatch);
            console.log("downloading file:", file.name)
            console.log(file.path)
            zipMultipart.file(file.path, fileDataBlob, { binary: true });
        }
    }

    //Generate the ZIP file and trigger the download
    zipMultipart.generateAsync({ type: "blob" }).then((content) => {
        const url = window.URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${folder.title}.zip`; // Set the file name
        a.click(); // Trigger the download
        // Clean up
        window.URL.revokeObjectURL(url);
    });


    // Make a request to download the file with responseType 'blob'
    Api.get(`/folder/download/${folder.uid}`)
        .then(async (res) => {

            // Iterate through the files and add them to the ZIP
            for (const file of res.data.files) {
                console.log(file)
                const fileData = atob(file.data);
                if (file.encryption_status === EncryptionStatus.Encrypted) {
                    const decryptionResult = await decryptMetadata(
                        file.name,
                        file.mime_type,
                        file.cid_original_encrypted,
                        personalSignature
                    );
                    if (!decryptionResult) {
                        logoutUser();
                        return;
                    }
                    const {
                        decryptedFilename,
                        decryptedFiletype,
                        decryptedCidOriginal,
                    } = decryptionResult;
                    const stringToArrayBuffer = (str: string): ArrayBuffer => {
                        const buf = new ArrayBuffer(str.length);
                        const bufView = new Uint8Array(buf);
                        for (let i = 0; i < str.length; i++) {
                            bufView[i] = str.charCodeAt(i);
                        }
                        return buf;
                    };

                    //transform fileData string to Array Buffer
                    const fileDataBufferEncrypted = stringToArrayBuffer(fileData);
                    const fileDataBuffer = await decryptFileBuffer(
                        fileDataBufferEncrypted,
                        decryptedCidOriginal,
                        () => void 0
                    );
                    if (!fileDataBuffer) {
                        toast.error("Failed to decrypt file");
                        return;
                    }
                    //transform buffer to Blob
                    const fileDataBlob = new Blob([fileDataBuffer], {
                        type: decryptedFiletype,
                    });

                    const decryptedFilePath = await decryptFilePath(
                        file.path,
                        decryptedFilename,
                        personalSignature
                    );

                    zip.file(decryptedFilePath, fileDataBlob, { binary: true });
                } else {
                    zip.file(file.path, fileData, { binary: true });
                }
            }

            //Generate the ZIP file and trigger the download
            zip.generateAsync({ type: "blob" }).then((content) => {
                const url = window.URL.createObjectURL(content);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${folder.title}.zip`; // Set the file name
                a.click(); // Trigger the download
                // Clean up
                window.URL.revokeObjectURL(url);
            });
        })
        .catch((err) => {
            console.error("Error downloading folder:", err);
        });
}

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

function indexOfSubArray(mainArray: Uint8Array, subArray: Uint8Array, startFromIndex = 0): number {
    for (let i = startFromIndex; i <= mainArray.length - subArray.length; i++) {
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

// Utility function to concatenate two Uint8Arrays
function concatenateUint8Arrays(array1: Uint8Array, array2: Uint8Array): Uint8Array {
    const tempBuffer = new Uint8Array(array1.length + array2.length);
    tempBuffer.set(array1);
    tempBuffer.set(array2, array1.length);
    return tempBuffer;
}

const boundaryString = "\r\n--boundary\r\n"
const endBoundaryString = "\r\n--boundary--\r\n"
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const BOUNDARY_LENGTH = boundaryString.length;
const BOUNDARY_ENCODED = new TextEncoder().encode(boundaryString);
const END_BOUNDARY_ENCODED = new TextEncoder().encode(endBoundaryString);
let previousEndSegment = new Uint8Array(BOUNDARY_LENGTH);

export const downloadFolderMultipart = async (folder: Folder, dispatch: AppDispatch, personalSignature: string) => {

    try {
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

        console.log("Starting download process...")

        const reader = response.body.getReader();
        let accumulated = new Uint8Array();

        console.log("Initialized variables")

        let aesKey: CryptoKey | undefined;
        let iv;
        let totalProcessed = 0;

        dispatch(setUploadStatusAction({
            info: "Downloading...",
            uploading: true,
            size: 0,
        }));

        const stream = new ReadableStream({
            async pull(controller) {
                console.log("Reading stream...")
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log("Stream reading completed")
                        controller.close();
                        break;
                    }

                    // Combine the end of the previous chunk with the start of the new chunk
                    const combinedData = concatenateUint8Arrays(previousEndSegment, value);


                    // Check for a boundary in the combined segment
                    let boundaryIndex = indexOfSubArray(combinedData, BOUNDARY_ENCODED, 0);
                    while (boundaryIndex !== -1) {
                        const nextBoundaryIndex = indexOfSubArray(combinedData, BOUNDARY_ENCODED, boundaryIndex + BOUNDARY_LENGTH);
                        const boundaryEnd = nextBoundaryIndex !== -1 ? nextBoundaryIndex : combinedData.length;
                        const segment = combinedData.slice(boundaryIndex + BOUNDARY_LENGTH, boundaryEnd);

                        // Process the segment (decrypt, enqueue, etc.)

                        console.log(`Processed segment, size: ${segment.length} bytes`);
                        boundaryIndex = nextBoundaryIndex;

                    }

                    accumulated = concatenateUint8Arrays(accumulated, value);
                    //console.log(`Read ${value.length} bytes from stream`)

                    let startIndex = 0;
                    // Process each file in the multipart response
                    while (startIndex < accumulated.length) {
                        console.log(`Processing from startIndex: ${startIndex}`)
                        const boundaryIndex = indexOfSubArray(accumulated, new TextEncoder().encode(boundaryString), startIndex);
                        if (boundaryIndex === -1) {
                            console.log("boundaryIndex not found, waiting for more data")
                            break;
                        }



                        // Find end of headers
                        const doubleNewLine = new TextEncoder().encode("\r\n\r\n");
                        const headerEndIndex = accumulated.indexOf(doubleNewLine[0], boundaryIndex + boundaryString.length);
                        if (headerEndIndex === -1) break; // Headers not complete yet
                        // Extract file name from headers
                        const headersPart = new TextDecoder().decode(accumulated.slice(0, headerEndIndex));
                        const match = /Content-Disposition: attachment; filename="?([^"]+)"?/.exec(headersPart);

                        const fileName = match ? match[1] : "unknown";
                        const decryptedFilename = await decryptFilename(fileName, personalSignature);

                        // Extract file content
                        const fileContentStartIndex = headerEndIndex + 4; // Skip past "\r\n\r\n"
                        const nextBoundaryIndex = indexOfSubArray(accumulated, new TextEncoder().encode(boundaryString), fileContentStartIndex);
                        if (nextBoundaryIndex === -1) {
                            if (accumulated.length > CHUNK_SIZE) {
                                console.error("Next boundary not found, but accumulated size is larger than CHUNK_SIZE")
                                throw new Error("Next boundary not found, but accumulated size is larger than CHUNK_SIZE");
                            }
                            break; // Wait for more data
                        }
                        console.log("Next boundary found")


                        console.log(`File boundary reached. File name: ${decryptedFilename}, File content size: ${fileContent.length} bytes`);

                        const fileContent = accumulated.slice(fileContentStartIndex, nextBoundaryIndex);





                        // Decrypt if needed
                        if (folder.encryption_status === "encrypted") {
                            if (!aesKey || !iv) {
                                // Obtain AES key and IV for the first chunk
                                // Use your decryption method here
                            }
                            // Decrypt fileContent using aesKey and iv
                        }





                        controller.enqueue(fileContent);
                        totalProcessed += fileContent.length;
                        dispatch(setUploadStatusAction({ read: totalProcessed }));


                        console.log(`Processed file: ${decryptedFilename}, size: ${fileContent.length} bytes`);
                        // Update startIndex for next iteration
                        startIndex = nextBoundaryIndex + boundaryString.length;
                        console.log("startIndex", startIndex)

                        // Update accumulated buffer to remove processed content
                        accumulated = accumulated.slice(startIndex);

                        // Update the previousEndSegment for the next iteration
                        if (value.length >= BOUNDARY_LENGTH) {
                            previousEndSegment = value.slice(-BOUNDARY_LENGTH);
                        }


                    }


                    // Check for end boundary
                    if (indexOfSubArray(combinedData, END_BOUNDARY_ENCODED) !== -1) {
                        console.log("End boundary found");
                        break;
                    }

                    // Update previousEndSegment for the next iteration
                    previousEndSegment = combinedData.slice(-BOUNDARY_LENGTH);


                }

                controller.close();
            }
        });


        const responseBlob = new Response(stream);
        const blob = new Blob([await responseBlob.blob()], { type: "application/octet-stream" });
        dispatch(setUploadStatusAction({
            info: "Finished downloading data",
            uploading: false,
        }));
        triggerDownload(blob, `${folder.title}.zip`);
    } catch (error) {
        console.error("Failed to fetch:", error);
        dispatch(setUploadStatusAction({
            info: "Failed to download data",
            uploading: false,
        }));
    }
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