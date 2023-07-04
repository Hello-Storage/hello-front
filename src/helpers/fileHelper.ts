import { decryptContent } from "./cipher";

export const decryptMetadata = async (encryptedMetadata: string, ivStr: string, key: CryptoKey) => {
    //decrypt metadata

    const encryptedMetadataBytes = Uint8Array.from(
        atob(encryptedMetadata),
        (c) => c.charCodeAt(0)
    )

    const iv = Uint8Array.from(atob(ivStr), (c) => c.charCodeAt(0))

    //deecrypt the metadata
    const metadataBuffer = await decryptContent(
        iv,
        key,
        encryptedMetadataBytes
    )

    //transform metadata from ArrayBuffer to string
    const decoder = new TextDecoder()
    const metadataString = decoder.decode(metadataBuffer)

    //transform metadata from string to JSON Object
    const metadata = JSON.parse(metadataString)

    return metadata
}