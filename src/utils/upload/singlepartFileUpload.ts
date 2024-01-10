import { AppDispatch } from "state";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { toast } from "react-toastify";
import { EncryptionStatus, File as FileType } from "api";
import { FileMap } from "api/types/files";
import { getCid } from "utils/encryption/filesCipher";
import { handleSinglepartFileEncryption } from "./singlepartFileEncryption";

export const singlepartFileUpload = async (personalSignature: string, encryptionEnabled: boolean | undefined, filesLength: number, index: number, file: File, dispatch: AppDispatch, isFolder: boolean, encryptionTimeTotal: number, root: string): Promise<{ filesMap: FileMap[], encryptionTimeTotal: number } | null> => {
    const filesMap: FileMap[] = [];
    if (encryptionEnabled) {
        const originalFile = file;
        const infoText = `Encrypting file ${index + 1} of ${filesLength}`;
        dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
        const encryptedResult = await handleSinglepartFileEncryption(
            file,
            personalSignature,
            isFolder,
            dispatch,
        );
        if (!encryptedResult) {
            toast.error("Failed to encrypt file");
            return null;
        }
        const {
            encryptedFile,
            cidOfEncryptedBufferStr,
            cidOriginalStr,
            cidOriginalEncryptedBase64Url,
            encryptedWebkitRelativePath,
            encryptionTime,
        } = encryptedResult;


        file = encryptedFile;



        encryptionTimeTotal += encryptionTime;

        const customFile: FileType = {
            name: encryptedFile.name,
            name_unencrypted: originalFile.name,
            cid: cidOfEncryptedBufferStr || "",
            id: 0,
            uid: "",
            cid_original_encrypted: cidOriginalEncryptedBase64Url || "",
            cid_original_unencrypted: cidOriginalStr || "",
            cid_original_encrypted_base64_url: cidOriginalEncryptedBase64Url,
            size: encryptedFile.size,
            root: root,
            mime_type: encryptedFile.type,
            mime_type_unencrypted: originalFile.type,
            media_type: encryptedFile.type.split("/")[0],
            path: encryptedWebkitRelativePath,
            encryption_status: EncryptionStatus.Encrypted,
            created_at: "",
            updated_at: "",
            deleted_at: "",
        }

        filesMap.push({ customFile, file });

    } else {
        const fileArrayBuffer = await file.arrayBuffer();
        const cidStr = await getCid(fileArrayBuffer, dispatch);

        const customFile: FileType = {
            name: file.name,
            name_unencrypted: file.name,
            cid: cidStr,
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

        filesMap.push({ customFile, file });

    }

    return { filesMap, encryptionTimeTotal };

}