import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { FilesUpload } from "api/types/upload";
import { toast } from "react-toastify";
import { Api, EncryptionStatus, File as FileType } from "api";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { getAesKey, getCipherBytes, getResultBytes } from "utils/encryption/filesCipher";
import { createFileAction, createFolderAction, setSelectedSharedFiles } from "state/mystorage/actions";
import { AxiosProgressEvent } from "axios";
import { AppDispatch } from "state";
import { FileMap, MultipartFile } from "api/types/files";
import { multipartFileUploadProcessing } from "./multipart/multipartFileUploadProcessing";
import { singlepartFileUploadProcessing } from "./singlepart/singlepartFileUploadProcessing";

const MULTIPART_THRESHOLD = import.meta.env.VITE_MULTIPART_THRESHOLD || 1073741824; // 1GiB or 10000 bytes


export const uploadFileMultipart = async (file: File, dispatch: AppDispatch, encryptionEnabled: boolean | undefined, cidOriginal: string, cidHash: string): Promise<{ cidOriginal: string, cidHash: string, encryptionTime: number }> => {
    const AES_GCM_TAG_LENGTH = 16;
    const { aesKey, salt, iv } = await getAesKey(cidOriginal, ['encrypt']);

    // TODO: calculate the chunk size based on the file size (to prevent errors like "minimun request size not reached")
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


export const getRoot = () =>
    location.pathname.includes("/space/folder")
        ? location.pathname.split("/")[3]
        : "/";

export const filesUpload = async (filesUpload: FilesUpload) => {

    const filesInitial = filesUpload.files;
    const files = Array.from(filesInitial);
    if (!files || files.length == 0) return;

    let outermostFolderTitle = "";
    if (filesUpload.isFolder) {
        outermostFolderTitle = files[0].webkitRelativePath != "" ? files[0].webkitRelativePath.split("/")[0]
            : (files[0] as any).path.split("/")[1];
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


    let sizesum = 0
    for (const element of files) {
        //if it is a folder upload, verify the sum of the sizes of the files in the folder
        if (filesUpload.isFolder) {
            sizesum += element.size
        }
    }

    const fileSlices: File[][] = []
    let wasSliced = false
    const SLICES_DIVISOR = 4
    let subSlice: File[] = []
    let subSum = 0
    const initialFilesLength = files.length


    //if folder size if greater than the THRESHOLD, slice it into multiple parts
    if (sizesum > MULTIPART_THRESHOLD && files.length > 1) {
        wasSliced = true
        for (let i = 0; i < initialFilesLength; i++) {
            const element = files.shift();
            if (element) {
                subSum += element.size
                subSlice.push(element)
                if (subSum > MULTIPART_THRESHOLD / SLICES_DIVISOR) {  // divide the THRESHOLD by the number of slices (if the THRESHOLD is 1GB, the slices will be 250MB)
                    fileSlices.push(subSlice)
                    subSlice = []
                    subSum = 0
                }
            }
        }
    } else {
        fileSlices.push(files)
    }

    // if there is a remainder, add it to the last slice
    if (subSlice.length > 0) {
        fileSlices.push(subSlice)
    }

    for (const files of fileSlices) {

        const filesMap: FileMap[] = [];
        const multipartFilesThis: MultipartFile[] = [];

        await ProcessFiles(files, filesUpload, personalSignature, encryptionTimeTotalThis, multipartFilesThis, wasSliced, filesMap, encryptedPathsMapping);

        let multipartFilesFound = false
        if (multipartFilesThis.length > 0) {
            multipartFilesFound = true
            await Api.post(`/file/pool/check`, multipartFilesThis.map(({ customFile }) => customFile))
                .then(async (res) => {

                    const filesFound: FileType[] = res.data.filesFound;

                    if (res.data && Array.isArray(res.data.filesFound) && res.data.filesFound.length > 0) {

                        // Dispatch actions for files that were found in S3.
                        const usedFileIndices = new Set<number>();
                        //dispatch fileFound
                        multipartFilesThis.forEach(({ customFile, file, cidOriginal }) => {
                            // Find a matching file in filesFound where the CID matches and it hasn't been used
                            const foundIndex = (filesFound ?? []).findIndex((fileFound, index) =>
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

                                if (!filesUpload.isFolder) filesUpload.dispatch(createFileAction(customFile))
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
                        const filesToUploadGroupedByCid: { [cid: string]: FileMap[] } = {};
                        filesToUpload.forEach(fileMap => {
                            const cid = fileMap.customFile.cid;
                            if (!filesToUploadGroupedByCid[cid]) {
                                filesToUploadGroupedByCid[cid] = [];
                            }
                            filesToUploadGroupedByCid[cid].push(fileMap);
                        });

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
                                    cidOriginalUnencrypted = firstFile.customFile.cid_original_unencrypted ?? "";
                                }
                                const { encryptionTime } = await uploadFileMultipart(filesToUpload[0].file, filesUpload.dispatch, filesUpload.encryptionEnabled, cidOriginalUnencrypted, filesToUpload[0].customFile.cid)
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

                                customFile.id = fileCreated?.id || 0;
                                customFile.uid = fileCreated?.uid || '';
                                customFile.created_at = fileCreated ? fileCreated.created_at.toString() : "";
                                customFile.updated_at = fileCreated ? fileCreated.updated_at.toString() : "";

                                customFile.is_in_pool = fileCreated?.is_in_pool || false;

                                customFile.name = customFile.name_unencrypted ?? '';
                                customFile.cid_original_encrypted = customFile.cid_original_unencrypted ?? '';
                                customFile.mime_type = customFile.mime_type_unencrypted ?? '';

                                if (!filesUpload.isFolder) {
                                    filesUpload.dispatch(createFileAction(customFile))
                                }
                            } catch (err) {
                                console.log(err);
                                toast.error("upload failed!");
                            }
                        });

                        await Promise.all(createPromises);
                    } else {
                        //upload files directly
                        const promises = multipartFilesThis.map(async ({ customFile, file, cidOriginal, cidOfEncryptedBufferStr }) => {
                            //upload chunks
                            console.log("fileFound: null")
                            const { encryptionTime } = await uploadFileMultipart(file, filesUpload.dispatch, filesUpload.encryptionEnabled, cidOriginal, cidOfEncryptedBufferStr)
                            encryptionTimeTotalThis += encryptionTime;

                            //post api metadata to /file/create
                            await Api.post("/file/create", customFile, {
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            })
                                .then((res) => {
                                    const fileCreated = res.data.fileCreated;


                                    if (!filesUpload.isFolder) {

                                        customFile.id = fileCreated?.id || 0;
                                        customFile.uid = fileCreated?.uid || '';
                                        customFile.created_at = fileCreated ? fileCreated.created_at.toString() : "";
                                        customFile.updated_at = fileCreated ? fileCreated.updated_at.toString() : "";
                                        customFile.is_in_pool = fileCreated?.is_in_pool || false;

                                        customFile.name = customFile.name_unencrypted ?? '';
                                        customFile.cid_original_encrypted = customFile.cid_original_unencrypted ?? '';
                                        customFile.mime_type = customFile.mime_type_unencrypted ?? '';


                                        filesUpload.dispatch(createFileAction(customFile))

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
                " " + encryptionSuffix;
            toast.success(`${encryptionTimeParsed}`);
        }


        const filesMessage = files.length === 1
            ? files[0].name
            : `uploading ${files.length} files`

        const infoText = filesUpload.isFolder
            ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
            : filesMessage;

        filesUpload.dispatch(setUploadStatusAction({ info: infoText, uploading: true }))

        postData(formData, filesMap, outermostFolderTitle,
            filesUpload.onUploadProgress, filesUpload.dispatch,
            filesUpload.isFolder, multipartFilesFound, filesUpload.encryptionEnabled, filesUpload.shareModal);
    }

}

export const postData = async (
    formData: FormData,
    filesMap: FileMap[],
    outermostFolderTitle: string,
    onUploadProgress: (progressEvent: AxiosProgressEvent) => void,
    dispatch: (action: any) => void,
    isFolder: boolean,
    multipartFilesFound: boolean,
    encryptionEnabled: boolean | undefined,
    shareModal?: boolean | undefined
) => {

    if (filesMap.length === 0) {
        if (multipartFilesFound) {
            toast.success("Upload succeeded!");
            dispatch(
                setUploadStatusAction({
                    info: "Finished uploading data",
                    uploading: false,
                })
            );
            dispatch(setUploadStatusAction({ uploading: false }))
        }
        return
    }

    const filesUploaded: FileType[] = [];

    // get customFiles from filesMap
    const customFiles = filesMap.map(fileMap => fileMap.customFile);
    let filesToUpload: FileMap[] = [];

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
                    formData.append(`webkitRelativePath[${index}]`, isFolder ? fileMap.customFile.path + "/" : fileMap.customFile.path)
                    if (fileMap.customFile.cid_original_encrypted_base64_url)
                        formData.append(`cidOriginalEncrypted[${index}]`, fileMap.customFile.cid_original_encrypted_base64_url)
                } else {
                    formData.append(`cid[${index}]`, fileMap.customFile.cid)
                    formData.append("files", fileMap.file)
                    formData.append(`webkitRelativePath[${index}]`, isFolder ? outermostFolderTitle + "/" : outermostFolderTitle)
                }
            })

            const filesFoundInS3 = filesMap.filter((fileMap) =>
                (filesFound || []).some(fileFound => fileFound.cid === fileMap.customFile.cid))

            filesFoundInS3.forEach((fileMap) => {
                if (filesFound) {
                    const fileFound = filesFound.find(f => f.cid === fileMap.customFile.cid)

                    fileMap.customFile.id = fileFound?.id ?? 0;
                    fileMap.customFile.uid = fileFound?.uid ?? "";
                    fileMap.customFile.created_at = fileFound ? fileFound.created_at.toString() : "";
                    fileMap.customFile.updated_at = fileFound ? fileFound.updated_at.toString() : "";
                    fileMap.customFile.is_in_pool = fileFound?.is_in_pool ?? false;

                    fileMap.customFile.name = fileMap.customFile.name_unencrypted ?? "";
                    fileMap.customFile.cid_original_encrypted = fileMap.customFile.cid_original_unencrypted ?? "";
                    fileMap.customFile.mime_type = fileMap.customFile.mime_type_unencrypted ?? "";


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
                // get all files and encryptedFiles into a singl files variable from formData
                const filesRes = res.data.files;

                folderRootUID = res.data.firstRootUID;

                for (let i = 0; i < filesRes.length; i++) {
                    // get file at index from formdata
                    const fileRes = filesRes[i];
                    const file = customFiles[i];

                    const fileObject: FileType = {
                        name: file.name_unencrypted ?? file.name,
                        cid: fileRes.cid,
                        id: fileRes.id,
                        uid: fileRes.uid,
                        cid_original_encrypted: file.cid_original_unencrypted ?? file.cid_original_encrypted,
                        size: file.size,
                        root: fileRes.root,
                        mime_type: file.mime_type_unencrypted ?? file.mime_type,
                        media_type: file.media_type,
                        path: file.path,
                        encryption_status: fileRes.encryption_status,
                        created_at: fileRes.created_at,
                        updated_at: fileRes.updated_at,
                        deleted_at: fileRes.deleted_at,
                    }
                    if (!isFolder && shareModal) filesUploaded.push(fileObject);
                    if (!isFolder) dispatch(createFileAction(fileObject));
                    toast.success("Upload succeeded!");
                    dispatch(
                        setUploadStatusAction({
                            info: "Finished uploading data",
                            uploading: false,
                        })
                    );

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

    if (shareModal) dispatch(setSelectedSharedFiles(filesUploaded));
    if (isFolder) {
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

async function ProcessFiles(files: File[], filesUpload: FilesUpload,
    personalSignature: string, encryptionTimeTotalThis: number, multipartFilesThis: MultipartFile[],
    wasSliced: boolean, filesMap: FileMap[], encryptedPathsMapping: { [key: string]: string }) {

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        filesUpload.dispatch(setUploadStatusAction({
            info: wasSliced ? "(Sliced) " : "" + "Uploading file " + (i + 1) + " of " + files.length,
            uploading: true,
        }))

        // if file size is bigger than 10 KB:
        if (file.size >= MULTIPART_THRESHOLD) {
            const multipartResult = await multipartFileUploadProcessing(file, filesUpload.isFolder, filesUpload.dispatch, filesUpload.encryptionEnabled, personalSignature, encryptionTimeTotalThis, filesUpload.root);
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
            const singlepartResult = await singlepartFileUploadProcessing(personalSignature, filesUpload.encryptionEnabled, files.length, i, file, filesUpload.dispatch, filesUpload.isFolder, encryptionTimeTotalThis, encryptedPathsMapping, filesUpload.root);
            if (singlepartResult) {
                const { encryptionTimeTotal, filesMap: filesMapRes } = singlepartResult;
                filesMap.push(...filesMapRes);
                encryptionTimeTotalThis += encryptionTimeTotal;
            } else {
                toast.error("Failed to upload singlepart file");
                return;
            }
        }
    }
}