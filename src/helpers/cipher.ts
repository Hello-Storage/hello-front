import Web3 from 'web3';
import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import { FileMetadata } from '../types';

const RAW_CODEC = 0x55;

export const caesarCipher = (text: string, shift: number) => {
    return text.split('').map(char => {
        const code = char.charCodeAt(0);
        // Shift all ASCII codes (from 32 to 126) to create a cipher that includes special characters and numbers.
        if (code >= 32 && code <= 126) {
            // To keep the cipher within printable characters, we subtract 32, add the shift, apply modulo 95, then add 32 back.
            return String.fromCharCode(((code - 32 + shift) % 95) + 32);
        }
        return char;
    }).join('');
};

export const deriveKey = async (hashBuffer: ArrayBuffer) => {
    return await crypto.subtle.importKey(
        "raw",
        hashBuffer,
        { name: "AES-CBC", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

export const digestMessage = async (message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
}

export const setPersonalSignature = async (addressTemp: string, password: string): Promise<void> => {
    //Caesar's cipher?
    const obfuscatedPassword = caesarCipher(password, 5);
    //Store signature to the session storage
    const web3 = new Web3(Web3.givenProvider);
    const signature = await web3.eth.personal.sign(obfuscatedPassword, addressTemp, "");
    //save signature to session storage
    sessionStorage.setItem("personalSignature", signature);
}

export const getHashFromSignature = async (signature: string): Promise<ArrayBuffer> => {
    const hash = await digestMessage(signature);
    return hash;
}

export const getKeyFromHash = async (hash: ArrayBuffer): Promise<CryptoKey> => {
    const key = await deriveKey(hash);
    return key;
}

export const encryptBuffer = async (buffer: ArrayBuffer, key: CryptoKey, iv: Uint8Array) => {

    //encrypt the message
    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        key,
        buffer
    );
    //concatenate the IV and encrypted file
    return encryptedBuffer;
}


export const encryptFileMetadata = async (file: File, key: CryptoKey) => {

    //generate an initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(16));

    //encrypt the message

    const metadataStr = JSON.stringify({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
    });

    const metadataArrayBuffer = new TextEncoder().encode(metadataStr);

    //encrypt the metadata
    const encryptedMetadataBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        key,
        metadataArrayBuffer
    );
    //concatenate the IV and encrypted file

    return { encryptedMetadataBuffer, iv };

}

export const encryptFileBuffer = async (file: File) => {
    //convert file to an array buffer
    const fileBuffer = await file.arrayBuffer();
    const uint8FileBuffer = new Uint8Array(fileBuffer);

    //hash the content
    const hash = await sha256.digest(uint8FileBuffer);
    //get CID of the file
    const cid = CID.create(1, sha256.code, hash);

    //tranform the cid to a string
    const cidStr = cid.toString();
    console.log(cidStr)
    //convert the string to an array buffer
    const cidArrayBuffer = await digestMessage(cidStr);


    //transform cidArrayBuffer into a CryptoKey
    const cidKey = await deriveKey(cidArrayBuffer);

    const iv = new Uint8Array(16);
    //start timer to calculate how much time it takes to encrypt the file
    const start = performance.now();

    //encrypt the file using AES and the cid as the key without iv
    const encryptedFileBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv: iv },
        cidKey,
        fileBuffer
    );

    //stop timer
    const end = performance.now();
    console.log(`Encrypting the file took ${end - start} milliseconds.`);

    //Hash the encrypted file buffer
    const encryptedHash = await sha256.digest(new Uint8Array(encryptedFileBuffer));
    //get CID of the encrypted file
    const encryptedCid = CID.create(1, RAW_CODEC, encryptedHash); 
    //tranform the cid to a string
    const cidOfEncryptedBufferStr = encryptedCid.toString();

    return {cidOfEncryptedBufferStr, cidStr, encryptedFileBuffer};

}
export const decryptContent = async (iv: Uint8Array, key: CryptoKey, encryptedFile: ArrayBuffer): Promise<ArrayBuffer> => {
    const decryptedContent = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        encryptedFile
    ).catch((err) => {
        console.log("Error decrypting content")
        console.log(err);
        return err;
    });
    

    return decryptedContent;
};
//key = await getKeyFromHash(hash);
export const decryptFile = async (iv: Uint8Array, key: CryptoKey, encryptedFileBuffer: ArrayBuffer, metadata: FileMetadata): Promise<File> => {
    console.log("iv:")
    console.log(iv)
    console.log("key:")
    console.log(key)
    console.log("encryptedFileBuffer:")
    console.log(encryptedFileBuffer)
    console.log("metadata:")
    console.log(metadata)
    const decryptedFileBuffer = await decryptContent(iv, key, encryptedFileBuffer)

    const file = new File([decryptedFileBuffer], metadata.name, { type: metadata.type, lastModified: metadata.lastModified });

    return file;
}
