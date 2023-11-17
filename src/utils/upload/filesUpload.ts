import { Api, EncryptionStatus, File as FileType } from "api";
import { AxiosProgressEvent } from "axios";
import { toast } from "react-toastify";
import { AppDispatch } from "state";
import { createFileAction, createFolderAction } from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";


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