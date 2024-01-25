import { CID } from "multiformats/cid"
import { sha256 } from "multiformats/hashes/sha2"
import { logoutUser } from "state/user/actions";
import { EncryptionStatus, File as FileType, Folder } from "api";
import { toast } from "react-toastify";

const RAW_CODEC = 0x55


// Utility Functions

const getPasswordBytes = (signature: string): Uint8Array => {
    return new TextEncoder().encode(signature);
}

const getAesKey = async (signature: string, usage: KeyUsage[], salt?: Uint8Array, iv?: Uint8Array): Promise<{ aesKey: CryptoKey, salt: Uint8Array, iv: Uint8Array }> => {
    const passwordBytes = getPasswordBytes(signature);
    const passwordKey = await window.crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, ['deriveKey']);
    salt = salt || window.crypto.getRandomValues(new Uint8Array(16));
    iv = iv || window.crypto.getRandomValues(new Uint8Array(12));

    const keyDerivationParams = {
        name: 'PBKDF2',
        salt: salt,
        iterations: 250000,
        hash: 'SHA-256',
    };
    const aesKey = await window.crypto.subtle.deriveKey(keyDerivationParams, passwordKey, { name: 'AES-GCM', length: 256 }, false, usage)

    return { aesKey, salt, iv };
}

const getCipherBytes = async (content: ArrayBuffer | Uint8Array, aesKey: CryptoKey, iv: Uint8Array): Promise<Uint8Array> => {
    const cipherBytes = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, aesKey, content);
    return new Uint8Array(cipherBytes);
}


const getResultBytes = (cipherBytesArray: Uint8Array, salt: Uint8Array, iv: Uint8Array): Uint8Array => {
    const resultBytes = new Uint8Array(cipherBytesArray.byteLength + salt.byteLength + iv.byteLength);
    resultBytes.set(salt, 0);
    resultBytes.set(iv, salt.byteLength);
    resultBytes.set(cipherBytesArray, salt.byteLength + iv.byteLength);
    return resultBytes;
}

const decryptContentUtil = async (cipherBytes: Uint8Array, aesKey: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> => {

    return await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, aesKey, cipherBytes).catch((err) => {
        console.log(err)
        return new ArrayBuffer(0)
    });
}



// Main functions


export const encryptMetadata = async (file: File, personalSignature: string | undefined): Promise<{ encryptedFilename: Uint8Array, encryptedFiletype: Uint8Array, fileSize: number, fileLastModified: number } | undefined> => {
    if (!personalSignature) {
        logoutUser();
        return;
    }
    const { aesKey, salt, iv } = await getAesKey(personalSignature, ['encrypt']);


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



    const { aesKey } = await getAesKey(personalSignature, ['decrypt'], salt, iv)
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

    //TODO: check if the file is encrypted before trying to decrypt, this causes problems

    const decryptValue = async (cipherBytes: Uint8Array) => {
        const salt = cipherBytes.slice(0, 16)
        const iv = cipherBytes.slice(16, 16 + 12)

        //log salt and iv in case they are null, undefined or empty
        if (!salt || !iv || salt.length === 0 || iv.length === 0) {
            console.log("dencrypting metadata for file with cidOriginalEncrypted failed: " + cidOriginalEncrypted)
            console.log("salt or iv are null, undefined or empty")
            console.log(salt)
            console.log(iv)
        }
        const decryptedValueArrayBuffer = await decryptContent(cipherBytes, personalSignature);
        return new TextDecoder().decode(decryptedValueArrayBuffer);
    }

    const decryptedFilename = await decryptValue(encryptedFilenameBuffer).catch((err) => {
        console.log("Error decrypting filename:")
        console.log(err)
        throw err
    });
    const decryptedCidOriginal = await decryptValue(encryptedCidOriginalBuffer).catch((err) => {
        console.log("Error decrypting cid original:")
        console.log(err)
        throw err
    });
    const decryptedFiletype = await decryptValue(encryptedFiletypeBuffer).catch((err) => {
        console.log("Error decrypting filetype:")
        console.log(err)
        throw err
    });

    return { decryptedFilename, decryptedFiletype, decryptedCidOriginal };
}

export const encryptBuffer = async (buffer: ArrayBuffer, personalSignature: string | undefined): Promise<Uint8Array | undefined> => {
    if (!personalSignature) {
        logoutUser();
        return;
    }
    const { aesKey, salt, iv } = await getAesKey(personalSignature, ['encrypt']);

    const cipherBytesArray = await getCipherBytes(buffer, aesKey, iv);


    return getResultBytes(cipherBytesArray, salt, iv);

}

export const getCid = async (buffer: Uint8Array): Promise<string> => {
    const uint8FileBuffer = new Uint8Array(buffer)
    const hash = await sha256.digest(uint8FileBuffer)
    const cid = CID.create(1, sha256.code, hash)

    return cid.toString()
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

export const encryptFileBuffer = async (fileArrayBuffer: ArrayBuffer) => {
    try {

        const uint8FileBuffer = new Uint8Array(fileArrayBuffer)

        const cidOriginalStr = await getCid(uint8FileBuffer);

        const emptySalt = new Uint8Array(16)

        const emptyIv = new Uint8Array(12)

        const { aesKey, salt, iv } = await getAesKey(cidOriginalStr, ['encrypt'], emptySalt, emptyIv)

        const start = performance.now();

        const cipherBytes = await getCipherBytes(uint8FileBuffer, aesKey, iv)

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