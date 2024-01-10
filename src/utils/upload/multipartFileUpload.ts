import { AppDispatch } from "state";
import { bufferToBase64Url, bufferToHex, cidToEncryptedBase64Url, encryptMetadata, encryptWebkitRelativePath, generateEncryptedFileCID, getCid } from "utils/encryption/filesCipher";
import { EncryptionStatus, File as FileType } from "api";
import { toast } from "react-toastify";
import { MultipartFile } from "api/types/files";

export const multipartFileUpload = async (file: File, isFolder: boolean, dispatch: AppDispatch, encryptionEnabled: boolean | undefined, personalSignature: string, encryptionTimeTotal: number, root: string): Promise<{ multipartFiles: MultipartFile[], encryptionTimeTotal: number } | null> => {
    // TODO: sepparate encrypted part and unencrypted part
    const multipartFiles: MultipartFile[] = [];
    const cidOriginal = await getCid(file, dispatch)


    let customFile: FileType;


    let _cidOfEncryptedBufferStr = "";


    if (encryptionEnabled) {
        const cidOriginalEncryptedBase64Url = await cidToEncryptedBase64Url(cidOriginal, personalSignature);
        let encryptedWebkitRelativePath = "";

        if (isFolder) {
            encryptedWebkitRelativePath = await encryptWebkitRelativePath(file.webkitRelativePath.split("/"), personalSignature);
        }

        const { cidOfEncryptedBufferStr, totalEncryptionTime } = await generateEncryptedFileCID(file, dispatch, cidOriginal)
        _cidOfEncryptedBufferStr = cidOfEncryptedBufferStr;

        encryptionTimeTotal += totalEncryptionTime;
        const encryptedMetadataResult = await encryptMetadata(
            file,
            personalSignature
        );
        if (!encryptedMetadataResult) {
            toast.error("Failed to encrypt metadata");
            return null;
        }
        const { encryptedFilename, encryptedFiletype } =
            encryptedMetadataResult;
        const encryptedFilenameBase64Url = bufferToBase64Url(encryptedFilename);
        const encryptedFiletypeHex = bufferToHex(encryptedFiletype);

        customFile = {
            name: encryptedFilenameBase64Url,
            name_unencrypted: file.name,
            cid: cidOfEncryptedBufferStr || "",
            id: 0,
            uid: "",
            cid_original_encrypted: cidOriginalEncryptedBase64Url || "",
            cid_original_unencrypted: cidOriginal || "",
            cid_original_encrypted_base64_url: cidOriginalEncryptedBase64Url,
            size: file.size,
            root: root,
            mime_type: encryptedFiletypeHex,
            mime_type_unencrypted: file.type,
            media_type: encryptedFiletypeHex.split("/")[0],
            path: encryptedWebkitRelativePath,
            encryption_status: EncryptionStatus.Encrypted,
            created_at: "",
            updated_at: "",
            deleted_at: "",
        }


        //filesMap.push({ customFile, file });
    } else {
        customFile = {
            name: file.name,
            name_unencrypted: file.name,
            cid: cidOriginal,
            id: 0,
            uid: "",
            cid_original_encrypted: "",
            size: file.size,
            root: root,
            mime_type: file.type,
            mime_type_unencrypted: file.type,
            media_type: file.type.split("/")[0],
            path: file.webkitRelativePath,
            encryption_status: EncryptionStatus.Public,
            created_at: "",
            updated_at: "",
            deleted_at: "",
        }
    }
    const cidOfEncryptedBufferStr = _cidOfEncryptedBufferStr;

    multipartFiles.push({ customFile, file, cidOriginal, cidOfEncryptedBufferStr });

    return { multipartFiles, encryptionTimeTotal };
}