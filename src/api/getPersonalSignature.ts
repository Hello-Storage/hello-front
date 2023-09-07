// store personalSignature in SS and set axios headers if we do have a token

import { signPersonalSignature } from "utils/encryption/cipherUtils";
import setPersonalSignature from "./setPersonalSignature";



const getPersonalSignature = async (walletAddress: string, autoEncryption: boolean, accountType: string | undefined): Promise<string | undefined> => {
    const personalSignature = sessionStorage.getItem("personal_signature");
    if (personalSignature !== null && autoEncryption) {
        return personalSignature;
    } else {
        if (accountType === "web3") {
            try {
                const personalSignature = await signPersonalSignature(walletAddress);
                setPersonalSignature(personalSignature);
                return personalSignature;
            } catch (error: any) {
                alert(error);
                console.log(error)
                //if error is ConnectorNotFoundError:
                if (error.includes("ConnectorNotFoundError")) {
                    //logoutUser();
                    return;
                }

            }
        } else if (accountType === "google" || accountType === "github" || accountType === "email") {
            //get hash of wallet address using window crypto api
            const walletHash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(walletAddress));
            walletAddress = btoa(String.fromCharCode(...new Uint8Array(walletHash)));

            setPersonalSignature(walletAddress);
            return walletAddress;
        } else {
           // logout();
            return;
        }
    }
};

export default getPersonalSignature;