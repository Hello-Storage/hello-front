import { CID } from "multiformats/cid"
import { sha256 } from "multiformats/hashes/sha2"
import { logoutUser } from "state/user/actions";
import { EncryptionStatus, File as FileType, Folder } from "api";
import getPersonalSignature from "api/getPersonalSignature";
import { toast } from "react-toastify";

const RAW_CODEC = sha256.code

import { createSHA256, sha256 as sha256wasm } from "hash-wasm";
import * as digest from 'multiformats/hashes/digest'
import { AppDispatch } from "state";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { string } from "yargs";


// Utility Functions

const getPasswordBytes = (signature: string): Uint8Array => {
    return new TextEncoder().encode(signature);
}

export const getAesKey = async (signature: string, usage: KeyUsage[], salt?: Uint8Array, iv?: Uint8Array): Promise<{ aesKey: CryptoKey, salt: Uint8Array, iv: Uint8Array }> => {
    const passwordBytes = getPasswordBytes(signature);
    const passwordKey = await window.crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveKey']);
    //salt = salt || window.crypto.getRandomValues(new Uint8Array(16));
    //iv = iv || window.crypto.getRandomValues(new Uint8Array(12));
    salt = salt || new Uint8Array(16).fill(0);
    iv = iv || new Uint8Array(12).fill(0);
    const keyDerivationParams = {
        name: 'PBKDF2',
        salt: salt,
        iterations: 250000,
        hash: 'SHA-256',
    };

    const aesKey = await window.crypto.subtle.deriveKey(keyDerivationParams, passwordKey, { name: 'AES-GCM', length: 256 }, false, usage);

    return { aesKey, salt, iv };
}

export const getCipherBytes = async (content: ArrayBuffer | Uint8Array, aesKey: CryptoKey, iv: Uint8Array): Promise<Uint8Array> => {
    const cipherBytes = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, aesKey, content);
    return new Uint8Array(cipherBytes);
}


export const getResultBytes = (cipherBytesArray: Uint8Array, salt: Uint8Array, iv: Uint8Array): Uint8Array => {
    const resultBytes = new Uint8Array(cipherBytesArray.byteLength + salt.byteLength + iv.byteLength);
    resultBytes.set(salt, 0);
    resultBytes.set(iv, salt.byteLength);
    resultBytes.set(cipherBytesArray, salt.byteLength + iv.byteLength);
    return resultBytes;
}

export const decryptContentUtil = async (cipherBytes: Uint8Array, aesKey: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> => {

    return await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, aesKey, cipherBytes).catch((err) => {
        console.log("Error decrypting buffer:")
        console.log(JSON.stringify(err))
        toast.error("Error decrypting buffer")
        return new ArrayBuffer(0)
    });
}



// Main functions


export const encryptMetadata = async (file: File, personalSignature: string | undefined): Promise<{ encryptedFilename: Uint8Array, encryptedFiletype: Uint8Array, fileSize: number, fileLastModified: number } | undefined> => {
    if (!personalSignature) {
        logoutUser();
        return;
    }
    //const salt = new Uint8Array(16).fill(0);
    //const iv = new Uint8Array(12).fill(0);
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const { aesKey } = await getAesKey(personalSignature, ['encrypt'], salt, iv);


    const encryptValue = async (value: string): Promise<Uint8Array> => {
        const valueArrayBuffer = new TextEncoder().encode(value)
        const cipherBytesArray = await getCipherBytes(valueArrayBuffer, aesKey, iv);
        return getResultBytes(cipherBytesArray, salt, iv);
    }

    const encryptedFilename = await encryptValue(file.name)
    const encryptedFiletype = await encryptValue(file.type)


    return { encryptedFilename, encryptedFiletype, fileSize: file.size, fileLastModified: file.lastModified };
}



export const decryptContent = async (cipherBytes: Uint8Array | string, personalSignature: string | undefined): Promise<ArrayBuffer | undefined> => {
    if (!personalSignature) {
        logoutUser();
        return;
    }
    if (typeof cipherBytes === 'string') {
        cipherBytes = Uint8Array.from(atob(cipherBytes), (c) => c.charCodeAt(0))
    }

    const salt = cipherBytes.slice(0, 16)
    const iv = cipherBytes.slice(16, 16 + 12)
    const data = cipherBytes.slice(16 + 12)
    const { aesKey } = await getAesKey(personalSignature, ['decrypt'], salt, iv);
    return decryptContentUtil(data, aesKey, iv);
}

export const decryptMetadata = async (encryptedFilenameBase64Url: string, encryptedFiletypeBase64Url: string, cidOriginalEncrypted: string, personalSignature: string | undefined): Promise<{ decryptedFilename: string, decryptedFiletype: string, decryptedCidOriginal: string } | undefined> => {
    if (!personalSignature) {
        logoutUser();
        return;
    }
    const encryptedFilenameBuffer = base64UrlToBuffer(encryptedFilenameBase64Url)
    const encryptedCidOriginalBuffer = base64UrlToBuffer(cidOriginalEncrypted)
    const encryptedFiletypeBuffer = hexToBuffer(encryptedFiletypeBase64Url)

    const decryptValue = async (cipherBytes: Uint8Array) => {
        const decryptedValueArrayBuffer = await decryptContent(cipherBytes, personalSignature);
        return new TextDecoder().decode(decryptedValueArrayBuffer);
    }

    const decryptedFilename = await decryptFilename(encryptedFilenameBase64Url, personalSignature)
    if (!decryptedFilename) {
        return;
    }
    const decryptedCidOriginal = await decryptValue(encryptedCidOriginalBuffer)
    const decryptedFiletype = await decryptValue(encryptedFiletypeBuffer)

    return { decryptedFilename, decryptedFiletype, decryptedCidOriginal };
}

export const decryptFilename = async (encryptedFilenameBase64Url: string, personalSignature: string | undefined): Promise<string | undefined> => {
    if (!personalSignature) {
        logoutUser();
        return;
    }
    const encryptedFilenameBuffer = base64UrlToBuffer(encryptedFilenameBase64Url)
    const decryptedFilename = await decryptContent(encryptedFilenameBuffer, personalSignature);
    return new TextDecoder().decode(decryptedFilename);
}

export const encryptBuffer = async (random: boolean, buffer: ArrayBuffer, personalSignature: string | undefined): Promise<Uint8Array | undefined> => {
    if (!personalSignature) {
        logoutUser();
        return;
    }
    let salt: Uint8Array;
    let iv: Uint8Array;
    if (random) {
        salt = window.crypto.getRandomValues(new Uint8Array(16));
        iv = window.crypto.getRandomValues(new Uint8Array(12));
    } else {
        salt = new Uint8Array(16).fill(0);
        iv = new Uint8Array(12).fill(0);
    }
    const { aesKey } = await getAesKey(personalSignature, ['encrypt'], salt, iv);

    const cipherBytesArray = await getCipherBytes(buffer, aesKey, iv);


    return getResultBytes(cipherBytesArray, salt, iv);

}

export async function generateFileCID(file: File, dispatch: AppDispatch): Promise<string> {
    const chunkSize = 100 << 20; // 100 MB
    //make 1KB chunksize:
    let offset = 0;
    const hasher = await createSHA256();

    dispatch(setUploadStatusAction({
        info: "Generating CID...",
        size: file.size,
        read: 0,
    }))


    return new Promise((resolve, reject) => {
        const readChunk = () => {
            const fileSlice = file.slice(offset, offset + chunkSize);
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    if (e.target?.result) {
                        const arrayBuffer = e.target.result as ArrayBuffer;
                        hasher.update(new Uint8Array(arrayBuffer)); //this is the line that makes it take a lot of time
                    }

                    offset += chunkSize;

                    const actualProcessed = Math.min(offset, file.size);

                    dispatch(setUploadStatusAction({
                        read: actualProcessed,
                    }))


                    if (offset < file.size) {
                        readChunk();
                    } else {
                        const hashBytes = hasher.digest('binary'); //(property) digest: (outputType?: "hex" | undefined) => string (+1 overload)
                        const mhdigest = digest.create(sha256.code, hashBytes);
                        const cid = CID.create(1, sha256.code, mhdigest); //(method) CID.create(version: CIDVersion, code: number, digest: MultihashDigest<number>): CID





                        resolve(cid.toString());
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(reader.error);
            };

            reader.readAsArrayBuffer(fileSlice);
        };

        readChunk();
    })
}


export async function generateEncryptedFileCID(file: File, dispatch: AppDispatch, cidOriginal: string): Promise<{ cidOfEncryptedBufferStr: string, totalEncryptionTime: number }> {
    const chunkSize = 100 << 20; // 100 MB
    //make 1KB chunksize:
    let offset = 0;
    const hasher = await createSHA256();
    let totalEncryptionTime = 0;
    const { aesKey, salt, iv } = await getAesKey(cidOriginal, ['encrypt']);

    dispatch(setUploadStatusAction({
        info: "Hashing file...",
        size: file.size,
        read: 0,
    }))


    return new Promise((resolve, reject) => {
        const readChunk = () => {
            const fileSlice = file.slice(offset, offset + chunkSize);
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    if (e.target?.result) {
                        const chunkArrayBuffer = e.target.result as ArrayBuffer;

                        const start = performance.now();
                        let encryptedChunk = await getCipherBytes(chunkArrayBuffer, aesKey, iv);
                        if (offset === 0) {
                            //get result bytes
                            encryptedChunk = getResultBytes(encryptedChunk, salt, iv);
                        }
                        const end = performance.now();
                        totalEncryptionTime += end - start;
                        hasher.update(new Uint8Array(encryptedChunk));

                    }

                    offset += chunkSize;

                    const actualProcessed = Math.min(offset, file.size);

                    dispatch(setUploadStatusAction({
                        read: actualProcessed,
                    }))

                    if (offset < file.size) {
                        readChunk();
                    } else {
                        const hashBytes = hasher.digest('binary'); //(property) digest: (outputType?: "hex" | undefined) => string (+1 overload)
                        const mhdigest = digest.create(sha256.code, hashBytes);
                        const cidOfEncryptedBufferStr = CID.create(1, sha256.code, mhdigest).toString(); //(method) CID.create(version: CIDVersion, code: number, digest: MultihashDigest<number>): CID





                        resolve({ cidOfEncryptedBufferStr, totalEncryptionTime });
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(reader.error);
            };

            reader.readAsArrayBuffer(fileSlice);
        };

        readChunk();
    })
}

export const getCid = async (buffer: ArrayBuffer | File, dispatch: AppDispatch): Promise<string> => {
    let cid = "";
    if (buffer instanceof ArrayBuffer) {
        dispatch(setUploadStatusAction({
            info: "Hashing file...",
        }));
        const hash = await sha256.digest(new Uint8Array(buffer))
        cid = CID.create(1, RAW_CODEC, hash).toString()
    } else {
        cid = await generateFileCID(buffer, dispatch).catch((err) => { toast.error("Error generating CID: " + err); throw err })
    }

    return cid.toString()
}

export const getHashString = async (string: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function bufferToBase64Url(buffer: Uint8Array): string {
    const str = String.fromCharCode(...buffer);
    let base64 = btoa(str);

    // Convert standard Base64 to Base64 URL encoding
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    return base64;
}

export function bufferToHex(buffer: Uint8Array): string {
    return Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function hexToBuffer(hex: string): Uint8Array {
    const buffer = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        buffer[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return buffer;
}

export function base64UrlToBuffer(base64Url: string): Uint8Array {
    try {
        // Convert Base64 URL encoding to standard Base64 encoding
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        const str = atob(base64);
        const buffer = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            buffer[i] = str.charCodeAt(i);
        }

        return buffer;
    } catch (error) {
        console.error("Error converting base64Url to buffer")
        console.error(error)
        throw error
    }
}

export const encryptFileBuffer = async (fileArrayBuffer: ArrayBuffer, dispatch: AppDispatch) => {
    try {


        const cidOriginalStr = await getCid(fileArrayBuffer, dispatch);

        const emptySalt = new Uint8Array(16)

        const emptyIv = new Uint8Array(12)

        const { aesKey, salt, iv } = await getAesKey(cidOriginalStr, ['encrypt'], emptySalt, emptyIv)

        const start = performance.now();

        const cipherBytes = await getCipherBytes(fileArrayBuffer, aesKey, iv)

        const end = performance.now();
        const encryptionTime = end - start || 0;





        const resultBytes = getResultBytes(cipherBytes, salt, iv)


        const encryptedHash = await sha256.digest(resultBytes)
        const cidOfEncryptedBuffer = CID.create(1, RAW_CODEC, encryptedHash)

        const cidOfEncryptedBufferStr = cidOfEncryptedBuffer.toString()


        return { cidOriginalStr, cidOfEncryptedBufferStr, encryptedFileBuffer: resultBytes, encryptionTime }
    } catch (error) {
        console.error('Error encrypting file')
        console.error(error)
        throw error
    }
}

export function blobToArrayBuffer(blob: Blob) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
    });
}

export const decryptFileBuffer = async (cipher: ArrayBuffer, originalCid: string, onProgress: (percentage: number) => void): Promise<ArrayBuffer | null> => {
    try {
        onProgress(10)
        const cipherBytes = new Uint8Array(cipher)
        const salt = cipherBytes.slice(0, 16)
        onProgress(25)
        const iv = cipherBytes.slice(16, 16 + 12)
        onProgress(40)
        const data = cipherBytes.slice(16 + 12)

        onProgress(55)
        const { aesKey } = await getAesKey(originalCid, ['decrypt'], salt, iv)
        onProgress(70)
        const decryptedContent = await decryptContentUtil(data, aesKey, iv)
        onProgress(100)
        return decryptedContent
    } catch (error) {
        console.error('Error decrypting file')
        console.error(error)
        throw error
    }
}

export const handleEncryptedFiles = async (files: FileType[], personalSignature: string, name: string, autoEncryptionEnabled: boolean, accountType: string | undefined, logout: () => void) => {

    if (personalSignature === undefined) {
        return;
    }
    // Using map to create an array of promises
    const decrytpedFilesPromises = files.map(async (file) => {
        if (file.encryption_status === EncryptionStatus.Encrypted && !file.decrypted) {
            try {
                const decryptionResult = await decryptMetadata(
                    file.name,
                    file.mime_type,
                    file.cid_original_encrypted,
                    personalSignature
                );
                if (decryptionResult) {
                    const {
                        decryptedFilename,
                        decryptedFiletype,
                        decryptedCidOriginal,
                    } = decryptionResult;
                    return {
                        ...file,
                        name: decryptedFilename,
                        mime_type: decryptedFiletype,
                        cid_original_encrypted: decryptedCidOriginal,
                        decrypted: true,
                    };
                }
            } catch (error) {
                console.log(error);
                return file;
            }
        }
        return file;
    });


    // Wait for all promises to resolve
    const decryptedFiles = await Promise.all(decrytpedFilesPromises);

    return decryptedFiles;
};

export const handleEncryptedFolders = async (folders: Folder[], personalSignature: string) => {
    if (personalSignature === undefined) {
        return;
    }
    // Using map to create an array of promises
    const decrytpedFoldersPromises = folders.map(async (folder) => {
        if (folder.encryption_status === EncryptionStatus.Encrypted && !folder.decrypted) {

            // encrypt file metadata and blob
            const folderTitleBuffer = hexToBuffer(folder.title);
            const decryptedTitleBuffer = await decryptContent(
                folderTitleBuffer,
                personalSignature
            );

            //transform buffer to Uint8Array
            const decryptedTitle = new TextDecoder().decode(decryptedTitleBuffer);

            return {
                ...folder,
                title: decryptedTitle,
                decrypted: true,
            };
        }
        return folder;

    });

    // Wait for all promises to resolve
    const decryptedFolders = await Promise.all(decrytpedFoldersPromises);
    return decryptedFolders;
}