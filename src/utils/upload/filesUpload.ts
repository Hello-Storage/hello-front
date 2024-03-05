import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { FilesUpload } from "api/types/upload";
import { toast } from "react-toastify";
import { Api, EncryptionStatus, File as FileType } from "api";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { getCid } from "utils/encryption/filesCipher";
import { createFileAction, createFolderAction, setSelectedSharedFiles } from "state/mystorage/actions";
import { AxiosProgressEvent } from "axios";
import { handleSinglepartEncryption } from "./singlepartEncryption";

export const getRoot = () =>
    location.pathname.includes("/space/folder")
        ? location.pathname.split("/")[3]
        : "/";

export const filesUpload = async (filesUpload: FilesUpload) => {

    const files = filesUpload.files;

    let outermostFolderTitle = "";

    if (filesUpload.isFolder && files.length > 0 && files[0].webkitRelativePath) {
        outermostFolderTitle = files[0].webkitRelativePath.split("/")[0];
    }

    const formData = new FormData();
    formData.append("root", filesUpload.root);

    let personalSignature = "";
    if (filesUpload.encryptionEnabled) {
        const personalSignatureTemp = await getPersonalSignature(
            filesUpload.name,
            filesUpload.encryptionEnabled,
            getAccountType(),
            filesUpload.logout
        )
        if (!personalSignatureTemp) {
            toast.error("Failed to get personal signature");
            filesUpload.logout();
            return;
        }
        personalSignature = personalSignatureTemp;
    }

    let encryptionTimeTotalThis = 0;

    const encryptedPathsMapping: { [path: string]: string } = {};

    const filesMap: { customFile: FileType, file: File }[] = [];

    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (filesUpload.encryptionEnabled) {
            const originalFile = file;
            const infoText = `Encrypting ${i + 1} of ${files.length}`;
            filesUpload.dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
            const encryptedResult = await handleSinglepartEncryption(
                file,
                personalSignature,
                filesUpload.isFolder,
                encryptedPathsMapping,
            );
            if (!encryptedResult) {
                toast.error("Failed to encrypt file");
                return;
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


            encryptionTimeTotalThis += encryptionTime;

            const customFile: FileType = {
                name: encryptedFile.name,
                name_unencrypted: originalFile.name,
                cid: cidOfEncryptedBufferStr || '',
                id: 0,
                uid: "",
                cid_original_encrypted: cidOriginalEncryptedBase64Url || '',
                cid_original_unencrypted: cidOriginalStr || '',
                cid_original_encrypted_base64_url: cidOriginalEncryptedBase64Url,
                size: encryptedFile.size,
                root: filesUpload.root,
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
            const uint8ArrayBuffer = new Uint8Array(await file.arrayBuffer());
            const cidStr = await getCid(uint8ArrayBuffer);

            const customFile: FileType = {
                name: file.name,
                cid: cidStr,
                id: 0,
                uid: "",
                cid_original_encrypted: "",
                size: file.size,
                root: filesUpload.root,
                mime_type: file.type,
                media_type: file.type.split("/")[0],
                path: file.webkitRelativePath,
                encryption_status: EncryptionStatus.Public,
                created_at: "",
                updated_at: "",
                deleted_at: "",
            }

            filesMap.push({ customFile, file });
        }
    }


    //parse encryption total of all files with encrypted option
    if (encryptionTimeTotalThis > 0) {
        let encryptionSuffix = "milliseconds";
        if (encryptionTimeTotalThis >= 1000 && encryptionTimeTotalThis < 60000) {
            encryptionTimeTotalThis /= 1000;
            encryptionSuffix = "seconds";
        } else if (encryptionTimeTotalThis >= 60000) {
            encryptionTimeTotalThis /= 60000;
            encryptionSuffix = "minutes";
        }
        const encryptionTimeParsed =
            "Encrypting the data took " +
            encryptionTimeTotalThis.toFixed(2).toString() +
            " " + encryptionSuffix;
        toast.success(`${encryptionTimeParsed}`);
    }


    const infoText = filesUpload.isFolder
        ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
        : files.length === 1
            ? files[0].name
            : `uploading ${files.length} files`;

    filesUpload.dispatch(setUploadStatusAction({ info: infoText, uploading: true }))


    postData(formData, filesMap, outermostFolderTitle, filesUpload.onUploadProgress, filesUpload.dispatch, filesUpload.isFolder, filesUpload.encryptionEnabled, filesUpload.shareModal);

}

export const postData = async (
    formData: FormData,
    filesMap: { customFile: FileType, file: File }[],
    outermostFolderTitle: string,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
    dispatch: (action: any) => void,
    isFolder: boolean,
    encryptionEnabled: boolean | undefined,
    shareModal?: boolean | undefined
) => {

    // iterate over each file and make a get request to check if cid exists in Api
    // post file metadata to api in case file is already in the pool

    const filesUploaded: FileType[] = [];

    // get customFiles from filesMap
    const customFiles = filesMap.map(fileMap => fileMap.customFile);
    let filesToUpload: { customFile: FileType, file: File }[] = [];

    let folderRootUID = "";
    await Api.post(`/file/pool/check`, customFiles)
        .then((res) => {
            // CIDs of files that were FOUND in S3 and need to be dispatched.
            const filesFound: FileType[] = res.data.filesFound;
            folderRootUID = res.data.firstRootUID;


            // Dispatch actions for files that were found in S3.
            filesToUpload = filesMap.filter((fileMap) => {
                const fileInFilesFound = (filesFound || []).some(fileFound => fileFound.cid === fileMap.customFile.cid);
                return !fileInFilesFound;
            })


            filesToUpload.forEach((fileMap, index) => {
                if (fileMap.customFile.encryption_status === EncryptionStatus.Encrypted) {
                    formData.append("encryptedFiles", fileMap.file)
                    formData.append(`cid[${index}]`, fileMap.customFile.cid)
                    formData.append(`webkitRelativePath[${index}]`, fileMap.customFile.path)
                    if (fileMap.customFile.cid_original_encrypted_base64_url)
                        formData.append(`cidOriginalEncrypted[${index}]`, fileMap.customFile.cid_original_encrypted_base64_url)
                } else {
                    formData.append(`cid[${index}]`, fileMap.customFile.cid)
                    formData.append("files", fileMap.file)
                    const root = fileMap.customFile.path.split("/")[1] ? fileMap.customFile.path.split("/")[1] + "/" : "";
                    formData.append(`webkitRelativePath[${index}]`, root)
                }
            })

            const filesFoundInS3 = filesMap.filter((fileMap) =>
                (filesFound || []).some(fileFound => fileFound.cid === fileMap.customFile.cid))

            filesFoundInS3.forEach((fileMap) => {
                if (filesFound) {
                    const fileFound = filesFound.find(f => f.cid === fileMap.customFile.cid)

                    fileMap.customFile.id = fileFound?.id || 0;
                    fileMap.customFile.uid = fileFound?.uid || "";
                    fileMap.customFile.created_at = fileFound ? fileFound.created_at.toString() : "";
                    fileMap.customFile.updated_at = fileFound ? fileFound.updated_at.toString() : "";
                    fileMap.customFile.is_in_pool = fileFound?.is_in_pool || false;

                    fileMap.customFile.name = fileMap.customFile.name_unencrypted || "";
                    fileMap.customFile.cid_original_encrypted = fileMap.customFile.cid_original_unencrypted || "";
                    fileMap.customFile.mime_type = fileMap.customFile.mime_type_unencrypted || "";

                    
                    if (!isFolder && shareModal) filesUploaded.push(fileMap.customFile);
                    if (!isFolder) dispatch(createFileAction(fileMap.customFile));
                }
            })

        }).catch((err) => {
            console.log(err)
        })

    if (filesToUpload.length !== 0) {
        await Api.post("/file/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        })
            .then((res) => {
                toast.success("Upload succeeded!");
                dispatch(
                    setUploadStatusAction({
                        info: "Finished uploading data",
                        uploading: false,
                    })
                );

                // get all files and encryptedFiles into a singl files variable from formData
                const filesRes = res.data.files;

                folderRootUID = res.data.firstRootUID;

                for (let i = 0; i < filesRes.length; i++) {
                    // get file at index from formdata
                    const fileRes = filesRes[i];
                    const file = customFiles[i];

                    const fileObject: FileType = {
                        name: file.name_unencrypted || file.name,
                        cid: fileRes.cid,
                        id: fileRes.id,
                        uid: fileRes.uid,
                        cid_original_encrypted: file.cid_original_unencrypted || file.cid_original_encrypted,
                        size: file.size,
                        root: fileRes.root,
                        mime_type: file.mime_type_unencrypted || file.mime_type,
                        media_type: file.media_type,
                        path: file.path,
                        encryption_status: fileRes.encryption_status,
                        created_at: fileRes.created_at,
                        updated_at: fileRes.updated_at,
                        deleted_at: fileRes.deleted_at,
                    }
                    if (!isFolder && shareModal) filesUploaded.push(fileObject);
                    if (!isFolder) dispatch(createFileAction(fileObject));
                }
            })
            .catch((err) => {
                console.log(err)
                toast.error("upload failed!")
            })
            .finally(() => dispatch(setUploadStatusAction({ uploading: false })))
    } else {
        toast.success("Upload succeeded!");
        dispatch(
            setUploadStatusAction({
                info: "Finished uploading data",
                uploading: false,
            })
        );
    }

    
    console.log("filesUploaded", filesUploaded)
    if (shareModal) dispatch(setSelectedSharedFiles(filesUploaded));
    if (isFolder && folderRootUID !== "" && outermostFolderTitle !== "") {
        dispatch(createFolderAction({
            title: outermostFolderTitle,
            uid: folderRootUID,
            root: getRoot(),
            created_at: "",
            updated_at: "",
            deleted_at: "",
            decrypted: true,
            id: 0,
            path: "/",
            encryption_status: encryptionEnabled ? EncryptionStatus.Encrypted : EncryptionStatus.Public,
        }))
    }
    dispatch(setUploadStatusAction({ uploading: false }))
}