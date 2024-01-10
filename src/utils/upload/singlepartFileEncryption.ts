import { toast } from "react-toastify";
import { AppDispatch } from "state";
import { bufferToBase64Url, bufferToHex, cidToEncryptedBase64Url, encryptFileBuffer, encryptMetadata, encryptWebkitRelativePath } from "utils/encryption/filesCipher";

export const handleSinglepartFileEncryption = async (
    file: File,
    personalSignature: string | undefined,
    isFolder: boolean,
    dispatch: AppDispatch,
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
    } = await encryptFileBuffer(fileArrayBuffer, dispatch);

    const encryptedFilenameBase64Url = bufferToBase64Url(encryptedFilename);
    const encryptedFiletypeHex = bufferToHex(encryptedFiletype);

    const cidOriginalEncryptedBase64Url = await cidToEncryptedBase64Url(cidOriginalStr, personalSignature)


    const encryptedFileBlob = new Blob([encryptedFileBuffer]);
    const encryptedFile = new File(
        [encryptedFileBlob],
        encryptedFilenameBase64Url,
        { type: encryptedFiletypeHex, lastModified: fileLastModified }
    );


    let encryptedWebkitRelativePath = "";
    if (isFolder) {
        encryptedWebkitRelativePath = await encryptWebkitRelativePath(file.webkitRelativePath.split("/"), personalSignature);
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