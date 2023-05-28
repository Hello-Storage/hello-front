import Web3 from "web3"
import mobileCheck from "../helpers/mobileCheck"
import getLinker from "../helpers/deepLink"
import axios from "axios"

export const connectMetamask = async (): Promise<string|Error> => {

    try {
        const webUrl = "http://localhost:8545" //replace with specific domain url
        const deepLink = `https://metamask.app.link/dapp/${webUrl}`
        const downloadMetamaskUrl = "https://metamask.io/download.html"

        if (window?.ethereum?.isMetaMask) {
            //Desktop browser
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            })

            const account = Web3.utils.toChecksumAddress(accounts[0])
            const address = await handleLogin(account)
            return address
        } else if (mobileCheck()) {
            //Mobile browser
            const linker = getLinker(downloadMetamaskUrl);
            linker.openURL(deepLink as string & Location);
            return new Error("Metamask not installed")
        } else {
            window.open(downloadMetamaskUrl, '_blank')
            return new Error("Metamask not installed")
        }
    } catch (error) {
        console.error(error)
        //create Error
        const err = new Error("Error connecting to Metamask: "+error)
        return err
    
    }

}



const handleLogin = async (address: string): Promise<string> => {
    const baseUrl = "https://ounn.space:80" //replace with specific domain url
    try {
        await axios.post(`${baseUrl}/register`, { address: address });
    } catch (error) {
        console.error(error);
    }

    const response = await axios.get(`${baseUrl}/users/${address}/nonce`);
    const messageToSign = response?.data?.nonce;

    if (!messageToSign) {
        throw new Error("Invalid message to sign");
    }

    const web3 = new Web3(Web3.givenProvider);
    const signature = await web3.eth.personal.sign(messageToSign, address, '');
    console.log('address: ', address, 'messageToSign: ', messageToSign, 'signature: ', signature)
    const jwtResponse = await axios.post(
        `${baseUrl}/signin`, { Address: address, Nonce: messageToSign, Sig: signature }
    );

    //alert jwtResponse all data
    //alert(JSON.stringify(jwtResponse))
    const customToken = jwtResponse?.data?.access;

    if (!customToken) {
        throw new Error("Invalid JWT");
    }
    //save customToken to local storage
    localStorage.setItem("customToken", customToken);
    //FIREBASE: await signInWithCustomToken(auth, customToken);
    return address;
};