import Web3 from 'web3';


export const digestMessage = async (message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
}

export const setPersonalSignature = async (addressTemp: string): Promise<string> => {
    //Caesar's cipher?
    //const obfuscatedPassword = caesarCipher(password, 5);
    const nonce = "http://hello.storage/\nPersonal signature\nNONCE: 1";
    //Store signature to the session storage
    const web3 = new Web3(Web3.givenProvider);
    const signature = await web3.eth.personal.sign(nonce, addressTemp, "");
    //save signature to session storage
    sessionStorage.setItem("personalSignature", signature);
    return signature;
}

export const getHashFromSignature = async (signature: string): Promise<ArrayBuffer> => {
    const hash = await digestMessage(signature);
    return hash;
}


