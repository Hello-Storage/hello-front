// store personalSignature in SS and set axios headers if we do have a token

import { signPersonalSignature } from "utils/encryption/cipherUtils";
import setPersonalSignature from "./setPersonalSignature";

const getPersonalSignature = async (walletAddress: string, autoEncryption: boolean): Promise<string | undefined> => {
    const personalSignature = sessionStorage.getItem("personal_signature");
    if (personalSignature !== null && autoEncryption) {
        return personalSignature;
    } else {
        try {
            const personalSignature = await signPersonalSignature(walletAddress);
            setPersonalSignature(personalSignature);
            return personalSignature;
        } catch (error: any) {
            console.log(error);
            //get hash of wallet address using window crypto api
            const walletHash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(walletAddress));
            walletAddress = btoa(String.fromCharCode(...new Uint8Array(walletHash)));

            setPersonalSignature(walletAddress);
            return walletAddress;
        }
    }
};

export default getPersonalSignature;