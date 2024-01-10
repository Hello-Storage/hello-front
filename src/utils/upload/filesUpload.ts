import { Api, EncryptionStatus, File as FileType } from "api";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { AxiosProgressEvent } from "axios";
import { toast } from "react-toastify";
import { AppDispatch } from "state";
import { createFileAction, createFolderAction } from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { User } from "state/user/reducer";
import { bufferToBase64Url, bufferToHex, encryptBuffer, encryptFileBuffer, encryptMetadata, getAesKey, getCipherBytes, getResultBytes } from "utils/encryption/filesCipher";
import { multipartFileUpload } from "./multipartFileUpload";
import { FileMap, MultipartFile } from "api/types/files";
import { singlepartFileUpload } from "./singlepartFileUpload";






const MULTIPART_THRESHOLD = import.meta.env.VITE_MULTIPART_THRESHOLD || 1073741824; // 1GiB or 10000 bytes




export const handleEncryption = async (
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
    const cidOriginalBuffer = new TextEncoder().encode(cidOriginalStr);
    const cidOriginalEncryptedBuffer = await encryptBuffer(
        false,
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
        const encryptedWebkitRelativePathTemp = await encryptWebkitRelativePath(file.webkitRelativePath.split("/"), personalSignature);
        if (!encryptedWebkitRelativePathTemp) {
            toast.error("Failed to encrypt webkitRelativePath");
            return null;
        }
        encryptedWebkitRelativePath = encryptedWebkitRelativePathTemp;
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

export const encryptWebkitRelativePath = async (
    pathComponents: string[],
    personalSignature: string | undefined,
): Promise<string | null> => {

    const encryptedPathsMapping: { [path: string]: string } = {};
    const encryptedPathComponents = [];
    let encryptedWebkitRelativePath = "";



    for (const component of pathComponents) {
        // If this component has been encrypted before, use the cached value
        if (encryptedPathsMapping[component]) {
            encryptedPathComponents.push(encryptedPathsMapping[component]);
        } else {
            const encodedComponent = new TextEncoder().encode(component);
            const encryptedComponentBuffer = await encryptBuffer(
                false,
                encodedComponent,
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

    return encryptedWebkitRelativePath;
}


export const uploadFileMultipart = async (file: File, dispatch: AppDispatch, encryptionEnabled: boolean | undefined, cidOriginal: string, cidHash: string): Promise<{ cidOriginal: string, cidHash: string, encryptionTime: number }> => {
    const AES_GCM_TAG_LENGTH = 16;
    const { aesKey, salt, iv } = await getAesKey(cidOriginal, ['encrypt']);

    const chunkSize = 5 * 1024 * 1024; // 5MB
    const fileSize = file.size;
    let offset = 0;
    dispatch(setUploadStatusAction({ uploading: true, size: fileSize, read: 0 }));


    let encryptionTime = 0;
    while (offset < fileSize) {
        const end = Math.min(file.size, offset + chunkSize - AES_GCM_TAG_LENGTH);
        let chunk = file.slice(offset, end);
        const isLastChunk = end >= file.size;

        const chunkArrayBuffer = await chunk.arrayBuffer();
        if (encryptionEnabled) {
            const start = performance.now();
            let encryptedChunk = await getCipherBytes(chunkArrayBuffer, aesKey, iv);
            if (offset === 0) {
                //get result bytes
                encryptedChunk = getResultBytes(encryptedChunk, salt, iv);
            }
            const end = performance.now();
            chunk = new Blob([encryptedChunk]);
            encryptionTime = end - start || 0;
        } else {
            chunk = new Blob([chunkArrayBuffer]);
        }
        const infoText = `Uploading part ${Math.floor(offset / chunkSize + 1)} of ${Math.ceil(file.size / chunkSize)}`;
        const read = offset + chunkArrayBuffer.byteLength;
        dispatch(setUploadStatusAction({ info: infoText, read }));

        if (encryptionEnabled) {
            await uploadChunk(chunk, offset, cidHash, isLastChunk).catch((err) => console.log(err));
        } else {
            await uploadChunk(chunk, offset, cidOriginal, isLastChunk).catch((err) => console.log(err));
        }
        offset = isLastChunk ? file.size : end;
    }


    return { cidOriginal, cidHash, encryptionTime };

}


export const uploadChunk = async (chunk: Blob, offset: number, cid: string, isLastChunk: boolean) => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('cid', cid);
    formData.append('offset', offset.toString());
    formData.append('isLastChunk', isLastChunk.toString());

    try {
        const response = await Api.post('/file/upload/multipart', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
        })
        console.log(response)
    } catch (error) {
        toast.error('Error uploading chunk: ' + error)
    }
}

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
        outermostFolderTitle = files[0].webkitRelativePath.split("/")[0];
    }


    const formData = new FormData();
    formData.append("root", root);

    let personalSignature = "";
    if (encryptionEnabled) {
        const personalSignatureTemp = await getPersonalSignature(
            name,
            encryptionEnabled,
            getAccountType(),
            logout,
        );
        if (!personalSignatureTemp) {
            toast.error("Failed to get personal signature");
            logout();
            return;
        }
        personalSignature = personalSignatureTemp;
    }


    let encryptionTimeTotalThis = 0;

    const filesMapThis: FileMap[] = [];
    const multipartFilesThis: MultipartFile[] = [];

    let folderRootUID = "";


    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        dispatch(setUploadStatusAction({
            info: "Uploading file " + (i + 1) + " of " + files.length,
            uploading: true,
        }))

        // if file size is bigger than 10 KB:
        if (file.size > MULTIPART_THRESHOLD) {
            const multipartResult = await multipartFileUpload(file, isFolder, dispatch, encryptionEnabled, personalSignature, encryptionTimeTotalThis, root);
            if (multipartResult) {
                const { multipartFiles, encryptionTimeTotal } = multipartResult;

                multipartFilesThis.push(...multipartFiles);
                encryptionTimeTotalThis += encryptionTimeTotal;

            } else {
                toast.error("Failed to upload multipart file");
                return;
            }
        } else {
            //singlepart file upload
            const singlepartResult = await singlepartFileUpload(personalSignature, encryptionEnabled, files.length, i, file, dispatch, isFolder, encryptionTimeTotalThis, root);
            if (singlepartResult) {
                const { encryptionTimeTotal, filesMap } = singlepartResult;
                encryptionTimeTotalThis += encryptionTimeTotal;
                filesMapThis.push(...filesMap);
            } else {
                toast.error("Failed to upload singlepart file");
                return;
            }
        }
    }
    if (multipartFilesThis.length > 0) {
        await Api.post(`/file/pool/check`, multipartFilesThis.map(({ customFile }) => customFile))
            .then(async (res) => {

                // CIDs of files that were FOUND in S3 and need to be dispatched.

                if (folderRootUID === "")
                    folderRootUID = res.data.firstRootUID;


                // Dispatch actions for files that were found in S3.
                if (res.data && Array.isArray(res.data.filesFound) && res.data.filesFound.length > 0) {
                    const usedFileIndices = new Set<number>();
                    const filesFound: FileType[] = res.data?.filesFound;
                    //dispatch fileFound
                    multipartFilesThis.forEach(({ customFile, file, cidOriginal }) => {
                        // Find a matching file in filesFound where the CID matches and it hasn't been used
                        const foundIndex = filesFound.findIndex((fileFound, index) =>
                            fileFound.cid === customFile.cid && !usedFileIndices.has(index)
                        );
                        if (foundIndex !== -1) {
                            customFile.id = filesFound[foundIndex].id;
                            customFile.uid = filesFound[foundIndex].uid;
                            customFile.created_at = filesFound[foundIndex].created_at.toString();
                            customFile.updated_at = filesFound[foundIndex].updated_at.toString();
                            customFile.is_in_pool = filesFound[foundIndex].is_in_pool;

                            customFile.name = file.name;
                            customFile.cid_original_encrypted = cidOriginal;
                            customFile.mime_type = file.type;

                            if (!isFolder) dispatch(createFileAction(customFile))
                            usedFileIndices.add(foundIndex)
                        }
                    })

                    // Remove the files that were found for later upload to S3
                    const filesToUpload = multipartFilesThis.filter(({ customFile }) => {
                        const isFound = filesFound.some(fileFound => fileFound.cid === customFile.cid);

                        return !isFound;
                    });


                    //Refactorization:
                    //Check both same unoploaded files in pool as normal
                    //Returned files cids are then grouped by on frontend
                    //Frontend creates processed cids, if cid chunks have
                    //been uploaded previously, instead of file chunk upload
                    //it directly creates file based on metadata marked as file exists in pool.

                    //group filesToUpload by cid
                    const filesToUploadGroupedByCid: { [cid: string]: { customFile: FileType, file: File }[] } = {};
                    filesToUpload.forEach(fileMap => {
                        const cid = fileMap.customFile.cid;
                        if (!filesToUploadGroupedByCid[cid]) {
                            filesToUploadGroupedByCid[cid] = [];
                        }
                        filesToUploadGroupedByCid[cid].push(fileMap);
                    })

                    // Mark the first file of each group as not in pool
                    Object.values(filesToUploadGroupedByCid).forEach(filesGroup => {
                        if (filesGroup.length > 0) {
                            filesGroup[0].customFile.is_in_pool = false; // Set the first file to not in pool
                        }
                    });

                    //iterate over each cid and upload chunks
                    const uploadPromises = Object.keys(filesToUploadGroupedByCid).map(async (cid) => {
                        const filesGroup = filesToUploadGroupedByCid[cid];
                        const firstFile = filesGroup[0];

                        if (firstFile) {
                            let cidOriginalUnencrypted = "";
                            if (firstFile.customFile.encryption_status === EncryptionStatus.Encrypted) {
                                cidOriginalUnencrypted = firstFile.customFile.cid_original_unencrypted || "";
                            }
                            const { encryptionTime } = await uploadFileMultipart(filesToUpload[0].file, dispatch, encryptionEnabled, cidOriginalUnencrypted, filesToUpload[0].customFile.cid)
                            encryptionTimeTotalThis += encryptionTime;
                        }

                    })

                    await Promise.all(uploadPromises);

                    // Post API metadata to /file/create, iterate over each cid from filesToUploadGroupedByCid
                    const createPromises = filesToUpload.map(async ({ customFile }) => {
                        try {
                            const res = await Api.post("/file/create", customFile, {
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            });

                            const fileCreated = res.data.fileCreated;
                            if (folderRootUID === "") {
                                folderRootUID = res.data.firstRootUID;
                            }

                            customFile.id = fileCreated?.id || 0;
                            customFile.uid = fileCreated?.uid || '';
                            customFile.created_at = fileCreated ? fileCreated.created_at.toString() : "";
                            customFile.updated_at = fileCreated ? fileCreated.updated_at.toString() : "";

                            customFile.is_in_pool = fileCreated?.is_in_pool || false;

                            customFile.name = customFile.name_unencrypted || '';
                            customFile.cid_original_encrypted = customFile.cid_original_unencrypted || '';
                            customFile.mime_type = customFile.mime_type_unencrypted || '';

                            if (!isFolder) {
                                dispatch(createFileAction(customFile))
                            }
                        } catch (err) {
                            console.log(err);
                            toast.error("upload failed!");
                        }
                    });

                    await Promise.all(createPromises);

                } else {

                    const promises = multipartFilesThis.map(async ({ customFile, file, cidOriginal, cidOfEncryptedBufferStr }) => {
                        //upload chunks
                        console.log("fileFound: null")
                        const { encryptionTime } = await uploadFileMultipart(file, dispatch, encryptionEnabled, cidOriginal, cidOfEncryptedBufferStr)
                        encryptionTimeTotalThis += encryptionTime;

                        //post api metadata to /file/create
                        /*
                        const formData = new FormData();
                        formData.append("root", root);
                        formData.append("name", customFile.name);
                        formData.append("cid", customFile.cid);
                        formData.append("cid_original_encrypted", customFile.cid_original_encrypted);
                        formData.append("mime", customFile.mime_type);
                        formData.append("size", customFile.size.toString());
                        formData.append("encryption_status", customFile.encryption_status.toString());
                        formData.append("path", customFile.path);
                */
                        await Api.post("/file/create", customFile, {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        })
                            .then((res) => {
                                if (folderRootUID === "")
                                    folderRootUID = res.data.firstRootUID;

                                const fileCreated = res.data.fileCreated;


                                if (!isFolder) {

                                    customFile.id = fileCreated?.id || 0;
                                    customFile.uid = fileCreated?.uid || '';
                                    customFile.created_at = fileCreated ? fileCreated.created_at.toString() : "";
                                    customFile.updated_at = fileCreated ? fileCreated.updated_at.toString() : "";
                                    customFile.is_in_pool = fileCreated?.is_in_pool || false;

                                    customFile.name = customFile.name_unencrypted || '';
                                    customFile.cid_original_encrypted = customFile.cid_original_unencrypted || '';
                                    customFile.mime_type = customFile.mime_type_unencrypted || '';


                                    dispatch(createFileAction(customFile))

                                }
                            })
                            .catch((err) => {
                                console.log(err);
                                toast.error("upload failed!");
                            })


                    })
                    await Promise.all(promises);




                }
            })
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
            " " +
            encryptionSuffix;
        toast.success(`${encryptionTimeParsed}`);
    }


    if (filesMapThis.length === 0) {
        dispatch(
            setUploadStatusAction({
                info: "Finished uploading data",
                uploading: false,
            })
        );
        if (isFolder && folderRootUID !== "" && outermostFolderTitle !== "") {
            console.log("creating folder 1")
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
        return;
    }
    const infoText = isFolder
        ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
        : files.length === 1
            ? files[0].name
            : `uploading ${files.length} files`;

    dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
    postData(folderRootUID, formData, filesMapThis, outermostFolderTitle, isFolder, dispatch, onUploadProgress, fetchUserDetail, root, encryptionEnabled);
};

export const postData = async (folderRootUID: string, formData: FormData, filesMap: { customFile: FileType, file: File }[], outermostFolderTitle: string, isFolder: boolean, dispatch: AppDispatch, onUploadProgress: (progressEvent: AxiosProgressEvent) => void, fetchUserDetail: () => void, root: string, encryptionEnabled: boolean | undefined) => {


    //iterate over each file and make a get request to check if cid exists in Api
    //post file metadata to api
    //get customFiles from filesMap
    const customFiles = filesMap.map(fileMap => fileMap.customFile);
    let filesToUpload: { customFile: FileType, file: File }[] = [];

    if (customFiles.length > 0) {
        await Api.post(`/file/pool/check`, customFiles)
            .then((res) => {
                // CIDs of files that were FOUND in S3 and need to be dispatched.
                const filesFound: FileType[] = res.data.filesFound;
                if (folderRootUID === "")
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
    }

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
        console.log("creating folder 2")
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