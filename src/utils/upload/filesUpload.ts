import { Api, EncryptionStatus, File as FileType } from "api";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { AxiosProgressEvent } from "axios";
import { toast } from "react-toastify";
import { AppDispatch } from "state";
import { createFileAction, createFolderAction } from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { User } from "state/user/reducer";
import { bufferToBase64Url, bufferToHex, encryptBuffer, encryptFileBuffer, encryptMetadata, getCid } from "utils/encryption/filesCipher";

const handleEncryption = async (
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

export const fileUpload = async (
    files: File[] | FileList | null,
    isFolder: boolean,
    root: string,
    encryptionEnabled: boolean | undefined,
    name: User["name"],
    logout: () => void,
    dispatch: AppDispatch,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
    fetchUserDetail: () => void,
) => {
    if (!files) return;

    let outermostFolderTitle = "";

    if (isFolder && files.length > 0 && files[0].webkitRelativePath) {
        outermostFolderTitle = files[0].webkitRelativePath.split("/")[1];
    }


    const formData = new FormData();
    formData.append("root", root);

    let personalSignature;
    if (encryptionEnabled) {
        personalSignature = await getPersonalSignature(
            name,
            encryptionEnabled,
            getAccountType(),
            logout,
        );
        if (!personalSignature) {
            toast.error("Failed to get personal signature");
            logout();
            return;
        }
    }

    const encryptedPathsMapping: { [path: string]: string } = {};

    let encryptionTimeTotal = 0;

    const filesMap: { customFile: FileType; file: File }[] = [];

    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        if (encryptionEnabled) {
            const originalFile = file;
            const infoText = `Encrypting file ${i + 1} of ${files.length}`;
            dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
            const encryptedResult = await handleEncryption(
                file,
                personalSignature,
                isFolder,
                encryptedPathsMapping
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
            const uint8ArrayBuffer = new Uint8Array(await file.arrayBuffer());
            const cidStr = await getCid(uint8ArrayBuffer);

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
    }

    //parse encryption total of all files with encrypted option
    if (encryptionTimeTotal > 0) {
        let encryptionSuffix = "milliseconds";
        if (encryptionTimeTotal >= 1000 && encryptionTimeTotal < 60000) {
            encryptionTimeTotal /= 1000;
            encryptionSuffix = "seconds";
        } else if (encryptionTimeTotal >= 60000) {
            encryptionTimeTotal /= 60000;
            encryptionSuffix = "minutes";
        }
        const encryptionTimeParsed =
            "Encrypting the data took " +
            encryptionTimeTotal.toFixed(2).toString() +
            " " +
            encryptionSuffix;
        toast.success(`${encryptionTimeParsed}`);
    }

    const infoText = isFolder
        ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
        : files.length === 1
            ? files[0].name
            : `uploading ${files.length} files`;

    dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
    postData(formData, filesMap, outermostFolderTitle, isFolder, dispatch, onUploadProgress, fetchUserDetail, root, encryptionEnabled);
};

export const postData = async (formData: FormData, filesMap: { customFile: FileType, file: File }[], outermostFolderTitle: string, isFolder: boolean, dispatch: AppDispatch, onUploadProgress: (progressEvent: AxiosProgressEvent) => void, fetchUserDetail: () => void, root: string, encryptionEnabled: boolean | undefined) => {

    //iterate over each file and make a get request to check if cid exists in Api
    //post file metadata to api
    //get customFiles from filesMap
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

            }
            )



            filesToUpload.forEach((fileMap, index) => {
                // Append the files that need to be uploaded to formData.
                if (fileMap.customFile.encryption_status === EncryptionStatus.Encrypted) {
                    formData.append("encryptedFiles", fileMap.file)
                    formData.append(`cid[${index}]`, fileMap.customFile.cid)
                    if (fileMap.customFile.cid_original_encrypted_base64_url)
                        formData.append(`cidOriginalEncrypted[${index}]`, fileMap.customFile.cid_original_encrypted_base64_url)
                    formData.append(`webkitRelativePath[${index}]`, fileMap.customFile.path)
                } else {
                    formData.append(`cid[${index}]`, fileMap.customFile.cid)
                    formData.append("files", fileMap.file)
                }
            })


            const filesFoundInS3 = filesMap.filter((fileMap) =>
                (filesFound || []).some(fileFound => fileFound.cid === fileMap.customFile.cid)
            )

            filesFoundInS3.forEach((fileMap) => {
                if (filesFound) {
                    const fileFound = filesFound.find(f => f.cid === fileMap.customFile.cid);

                    //replace for customFile in fileMap values:
                    //- put name_unencrypted to name
                    //- put cid_original_unencrypted to cid_original_encrypted
                    //- put mime_type_unencrypted to mime_type

                    fileMap.customFile.id = fileFound?.id || 0;
                    fileMap.customFile.uid = fileFound?.uid || '';
                    fileMap.customFile.created_at = fileFound ? fileFound.created_at.toString() : "";
                    fileMap.customFile.updated_at = fileFound ? fileFound.updated_at.toString() : "";
                    fileMap.customFile.is_in_pool = fileFound?.is_in_pool || false;

                    fileMap.customFile.name = fileMap.customFile.name_unencrypted || '';
                    fileMap.customFile.cid_original_encrypted = fileMap.customFile.cid_original_unencrypted || '';
                    fileMap.customFile.mime_type = fileMap.customFile.mime_type_unencrypted || '';


                    if (!isFolder) dispatch(createFileAction(fileMap.customFile))
                }

            })
        })
        .catch((err) => {
            console.log(err);
        });

    if (filesToUpload.length !== 0) {
        await Api.post("/file/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        })
            .then((res) => {
                toast.success("upload Succeed!");
                dispatch(
                    setUploadStatusAction({
                        info: "Finished uploading data",
                        uploading: false,
                    })
                );

                //getAll files and encryptedFils into a single files variable from formData
                const filesRes = res.data.files;



                for (let i = 0; i < filesRes.length; i++) {
                    //get file at index from formdata
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
                    if (!isFolder) dispatch(createFileAction(
                        fileObject
                    ))

                }

            })
            .catch((err) => {
                console.log(err);
                toast.error("upload failed!");
            })
            .finally(() => dispatch(setUploadStatusAction({ uploading: false })));
    } else {
        toast.success("upload Succeed!");
        dispatch(
            setUploadStatusAction({
                info: "Finished uploading data",
                uploading: false,
            })
        );

    }
    if (isFolder && folderRootUID !== "" && outermostFolderTitle !== "") {
        dispatch(createFolderAction({
            title: outermostFolderTitle,
            uid: folderRootUID,
            root: root,
            created_at: "",
            updated_at: "",
            deleted_at: "",
            id: 0,
            path: "/",
            encryption_status: encryptionEnabled ? EncryptionStatus.Encrypted : EncryptionStatus.Public,
        }))
    }
    fetchUserDetail();
    dispatch(setUploadStatusAction({ uploading: false }))
}; 