import { toast } from "react-toastify";
import { bufferToBase64Url, bufferToHex, encryptBuffer, encryptFileBuffer, encryptMetadata } from "utils/encryption/filesCipher";

export const handleSinglepartEncryption = async (
    file: File,
    personalSignature: string | undefined,
    isFolder: boolean,
    encryptedPathsMapping: { [path: string]: string }
): Promise<{
    encryptedFile: File;
    cidOfEncryptedBufferStr: string;
    cidOriginalStr?: string;
    cidOriginalEncryptedBase64Url: string;
    encryptedWebkitRelativePath: string;
    encryptionTime: number;
} | null> => {
    const fileArrayBuffer = await file.arrayBuffer();

    const encryptedMetadataResult = await encryptMetadata(
        file,
        personalSignature
    );
    if (!encryptedMetadataResult) {
        toast.error("Failed to encrypt metadata");
        return null;
    }
    const { encryptedFilename, encryptedFiletype, fileLastModified } =
        encryptedMetadataResult;
    const {
        cidOriginalStr,
        cidOfEncryptedBufferStr,
        encryptedFileBuffer,
        encryptionTime,
    } = await encryptFileBuffer(fileArrayBuffer);

    const encryptedFilenameBase64Url = bufferToBase64Url(encryptedFilename);
    const encryptedFiletypeHex = bufferToHex(encryptedFiletype);
    const cidOriginalBuffer = new TextEncoder().encode(cidOriginalStr);
    const cidOriginalEncryptedBuffer = await encryptBuffer(
        cidOriginalBuffer,
        personalSignature
    );

    if (!cidOriginalEncryptedBuffer) {
        toast.error("Failed to encrypt buffer");
        return null;
    }
    const cidOriginalEncryptedBase64Url = bufferToBase64Url(
        cidOriginalEncryptedBuffer
    );
    const encryptedFileBlob = new Blob([encryptedFileBuffer]);
    const encryptedFile = new File(
        [encryptedFileBlob],
        encryptedFilenameBase64Url,
        { type: encryptedFiletypeHex, lastModified: fileLastModified }
    );

    let encryptedWebkitRelativePath = "";
    if (isFolder) {
        const pathComponents = file.webkitRelativePath.split("/");
        const encryptedPathComponents = [];
        for (const component of pathComponents) {
            // If this component has been encrypted before, use the cached value
            if (encryptedPathsMapping[component]) {
                encryptedPathComponents.push(encryptedPathsMapping[component]);
            } else {
                const encryptedComponentBuffer = await encryptBuffer(
                    new TextEncoder().encode(component),
                    personalSignature
                );
                if (!encryptedComponentBuffer) {
                    toast.error("Failed to encrypt buffer");
                    return null;
                }
                const encryptedComponentHex = bufferToHex(encryptedComponentBuffer);
                encryptedPathsMapping[component] = encryptedComponentHex;
                encryptedPathComponents.push(encryptedComponentHex);
            }
        }

        // Reconstruct the encrypted webkitRelativePath
        encryptedWebkitRelativePath = encryptedPathComponents.join("/");
    }

    return {
        encryptedFile,
        cidOfEncryptedBufferStr,
        cidOriginalStr,
        cidOriginalEncryptedBase64Url,
        encryptedWebkitRelativePath,
        encryptionTime,
    };
};
