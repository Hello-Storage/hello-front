import Web3 from 'web3';

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


export const encryptFile = async (file: File, keyBuffer: ArrayBuffer) => {
    //generate a key suitable for AES-CBC from raw key
    const key = await crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-CBC", length: 256 },
        true,
        ["encrypt", "decrypt"]
    )

    //generate an initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(16));

    //transform the file into an ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer();    

    //encrypt the message
    const encryptedFileBuffer = await crypto.subtle.encrypt(
        { name: "AES-CBC", iv },
        key,
        fileArrayBuffer
    );

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

    return { encryptedFileBuffer, encryptedMetadataBuffer, iv };

}

export const decryptContent = async (iv: Uint8Array, key: CryptoKey, encryptedFile: ArrayBuffer): Promise<ArrayBuffer> => {
    const decryptedContent = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        encryptedFile
    );

    return decryptedContent;
};
//key = await getKeyFromHash(hash);
export const decryptFile = async (iv: Uint8Array, key: CryptoKey, encryptedFileBuffer: ArrayBuffer, encryptedMetadataBuffer: ArrayBuffer): Promise<File> => {

    const decryptedFileBuffer = await decryptContent(iv, key, encryptedFileBuffer);
    const decryptedMetadataBuffer = await decryptContent(iv, key, encryptedMetadataBuffer);

    const metadata = JSON.parse(new TextDecoder().decode(decryptedMetadataBuffer));

    const file = new File([decryptedFileBuffer], metadata.name, { type: metadata.type, lastModified: metadata.lastModified });

    return file;
}
