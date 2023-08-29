import Web3 from "web3";
import { signMessage } from "@wagmi/core";

export const digestMessage = async (message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
}


export const getPersonalSignature = async (address: string): Promise<string> => {
    const message = `https://hello.storage/\nPersonal signature\n\nWallet address:\n${address}`

    const web3 = new Web3(Web3.givenProvider)
    
    const signature = await signMessage({ message });

    //return personal signature
    return signature;
}


export const getHashFromSignature = async (signature: string): Promise<ArrayBuffer> => {
    const hash = await digestMessage(signature);
    return hash;
}