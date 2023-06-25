import { useState } from 'react';
import { PasswordModalProps } from "../types";
import { connectMetamask } from '../requests/metaRequests';
import { savePassword } from '../requests/clientRequests';
import { caesarCipher } from '../helpers/cipher';
import Web3 from 'web3';

const PasswordModal = ({
    showPasswordModal,
    closePasswordModal,
    setAddress,
    setLoading,
    setToastMessage,
    setShowToast,
}: PasswordModalProps) => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        validatePassword(e.target.value);
    };

    const validatePassword = (password: string) => {
        const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pattern.test(password)) {
            setPasswordError('Password must include an uppercase letter, a number, 8 characters long and a special character');
        } else {
            setPasswordError('');
        }
    }

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    async function digestMessage(message: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return hash;
    }

    async function deriveKey(hashBuffer: ArrayBuffer) {
        return await crypto.subtle.importKey(
            "raw",
            hashBuffer,
            {name: "AES-CBC", length: 256},
            false,
            ["encrypt", "decrypt"]
        );
    }

    async function encryptFile(message: string, keyBuffer: ArrayBuffer) {
        //generate a key suitable for AES-CBC from raw key
        const key = await crypto.subtle.importKey(
            "raw",
            keyBuffer,
            {name: "AES-CBC", length: 256},
            true,
            ["encrypt", "decrypt"]
        )

        //generate an initialization vector (IV)
        const iv = crypto.getRandomValues(new Uint8Array(16));

        //transform the message into an ArrayBuffer
        const messageBuffer = new TextEncoder().encode(message);

        //encrypt the message
        const encryptedFile = await crypto.subtle.encrypt(
            {name: "AES-CBC", iv},
            key,
            messageBuffer
        );
        //concatenate the IV and encrypted file
        
        return {encryptedFile, iv};

    }

    const handleSubmit = async () => {
        if (!passwordError) {
            closePasswordModal();
            //alert the password
            const addressTemp: (string | Error) = await connectMetamask();
            if (addressTemp instanceof Error) {
                alert(addressTemp.message)
            } else {
                const response = await savePassword(password);

                //check if the response is an error
                if (response instanceof Error) {
                    //extend response so it response.response.data exists
                    const error = response as any;
                    //remove customToken from localStorage
                    localStorage.removeItem("customToken");
                    //setLoading to false
                    setLoading(false);
                    //set toast message to error.response.data
                    setToastMessage(error.response.data);
                    //show toast
                    setShowToast(true);
                    return;
                }
                //Caesar's cipher?
                const obfuscatedPassword = caesarCipher(password, 5);
                //Store signature to the session storage
                const web3 = new Web3(Web3.givenProvider);
                const signature = await web3.eth.personal.sign(obfuscatedPassword, addressTemp, "");

                //digest the signature and alert it
                const hash = await digestMessage(signature);
                const key = await deriveKey(hash);

                //encrypt with message "Hola a todos!"
                const {encryptedFile, iv} = await encryptFile("Hola a todos!", hash);

                //log the encrypted file and the iv
                console.log("Encrypted file: ")
                console.log(encryptedFile);
                console.log("IV: ");
                console.log(iv);

                //decrypt the file
                const decryptedFile = await crypto.subtle.decrypt(
                    {name: "AES-CBC", iv},
                    key,
                    encryptedFile
                );

                //decode the file
                const decryptedFileText = new TextDecoder().decode(decryptedFile);

                //log the decrypted file
                console.log("Decrypted file: ");
                console.log(decryptedFileText);

                //add the signature to the session storage
                sessionStorage.setItem("signingKey", signature);
                setAddress(addressTemp);
                setLoading(false);
            }
        }
    }

    return (
        <>
            <div style={{ display: showPasswordModal ? "block" : "none" }} className="modal-backdrop show"></div>
            <div style={{ display: showPasswordModal ? "block" : "none" }} className="modal show fade" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Account password</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={closePasswordModal} aria-label="Closx"></button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group">
                                <input type={showPassword ? "text" : "password"} className={`form-control ${passwordError ? 'is-invalid' : ''}`} value={password} onChange={handlePasswordChange} />
                                <button className="btn btn-outline-secondary" type="button" onClick={togglePassword}>{showPassword ? "Hide" : "Show"}</button>
                                {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={closePasswordModal} data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSubmit}>Sign in</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PasswordModal;