import { Api, EncryptionStatus, File } from "api";
import { AxiosProgressEvent } from "axios";
import { useModal } from "components/Modal";
import { Spinner4 } from "components/Spinner";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useAppSelector } from "state";
import { PreviewImage, setFileViewAction, setImageViewAction } from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { blobToArrayBuffer, decryptFileBuffer } from "utils/encryption/filesCipher";

import closeicon from "../../assets/images/file-viewer-resources/close-btn.svg";
import downloadicon from "../../assets/images/file-viewer-resources/download-btn.svg";
import fullscreenicon1 from "../../assets/images/file-viewer-resources/fullscreen-1.svg";
import fullscreenicon2 from "../../assets/images/file-viewer-resources/fullscreen-2.svg";
import thumbnailicon from "../../assets/images/file-viewer-resources/thumbnail-btn.svg";
import zoominicon from "../../assets/images/file-viewer-resources/zoom-in.svg";
import zoomouticon from "../../assets/images/file-viewer-resources/zoom-out.svg";
import { Thumbnail } from "./components/Thumbnail";


interface CustomFileViewerProps {
    files: File[];
}

export const CustomFileViewer: React.FC<CustomFileViewerProps> = ({ files }) => {
    const [, onDismiss] = useModal(<></>);
    const [actualItem, setActualItem] = useState<PreviewImage>();
    const [cache, setCache] = useState<Record<string, Blob>>({});
    const { selectedShowFile } = useAppSelector((state) => state.mystorage);
    const dispatch = useDispatch();


    const downloadAndProcessFile = async (
        file: File
    ) => {
        try {
            // Check if the file is already in the cache
            if (!cache[file.uid]) {
                // If file not in cache, download it
                const res = await Api.get(`/file/download/${file.uid}`, {
                    responseType: "blob",
                    onDownloadProgress: (progressEvent) =>
                        onDownloadProgress(progressEvent, file),
                });

                // Update status after download
                dispatch(
                    setUploadStatusAction({
                        info: "Finished downloading data",
                        uploading: false,
                    })
                );

                let binaryData = res.data;

                // Check and handle file decryption if needed
                if (file.encryption_status === EncryptionStatus.Encrypted) {
                    const originalCid = file.cid_original_encrypted;
                    binaryData = await blobToArrayBuffer(binaryData);
                    binaryData = await decryptFileBuffer(
                        binaryData,
                        originalCid,
                        (percentage) => {
                            dispatch(
                                setUploadStatusAction({
                                    info: "Decrypting...",
                                    read: percentage,
                                    size: 100,
                                    uploading: true,
                                })
                            );
                        }
                    );

                    dispatch(
                        setUploadStatusAction({
                            info: "Decryption done",
                            uploading: false,
                        })
                    );
                }

                if (file.file_share_state && file.file_share_state.id !== 0) {
                    const originalCid = file.file_share_state.public_file.cid_original_decrypted;
                    if (originalCid != "") {
                        binaryData = await blobToArrayBuffer(binaryData);
                        binaryData = await decryptFileBuffer(
                            binaryData,
                            originalCid,
                            (percentage) => {
                                dispatch(
                                    setUploadStatusAction({
                                        info: "Decrypting...",
                                        read: percentage,
                                        size: 100,
                                        uploading: true,
                                    })
                                );
                            }
                        ).catch(() => {
                            toast.error("Error downloading file");
                        });

                        dispatch(
                            setUploadStatusAction({
                                info: "Decryption done",
                                uploading: false,
                            })
                        );
                    } else {
                        binaryData = await blobToArrayBuffer(binaryData);
                    }
                }

                const blob = new Blob([binaryData], {
                    type: file.mime_type,
                });

                // Check for blob creation success
                if (!blob) {
                    console.error("Error downloading file:", file);
                    return;
                }

                // Update cache with the new file
                setCache((prevCache) => ({
                    ...prevCache,
                    [file.uid]: blob,
                }));

                const url = window.URL.createObjectURL(blob);

                // Process downloaded file based on MIME type
                let mediaItem: PreviewImage;
                if (file.mime_type.startsWith("video/")) {
                    // Handle video files
                    mediaItem = {
                        type: "video",
                        src: url,
                        alt: file.name,
                    };
                } else {
                    // Handle other file types
                    mediaItem = {
                        type: file.mime_type.startsWith("image/") ? "image" : "other",
                        src: url,
                        alt: file.name,
                    };
                }
                return mediaItem;
            } else {
                const blob = cache[file.uid];
                const url = window.URL.createObjectURL(blob);

                // Process file based on MIME type
                let mediaItem: PreviewImage;
                if (file.mime_type.startsWith("video/")) {
                    // Handle video files
                    mediaItem = {
                        type: "video",
                        src: url,
                        alt: file.name,

                    };
                } else {
                    // Handle other file types
                    mediaItem = {
                        type: file.mime_type.startsWith("image/") ? "image" : "other",
                        src: url,
                        alt: file.name,
                    };
                }

                return mediaItem;
            }
        } catch (err: any) {
            dispatch(setFileViewAction({ file: undefined }));
            toast.error(err.message);
        }
    };

    const onDownloadProgress = (
        progressEvent: AxiosProgressEvent,
        file: File
    ) => {
        dispatch(
            setUploadStatusAction({
                info: `${"Loading"} ` + file.name,
                uploading: true,
            })
        );
        dispatch(
            setUploadStatusAction({
                read: progressEvent.loaded,
                size: file.size,
            })
        );
    };

    useEffect(() => {
        dispatch(setImageViewAction({ show: false }));
    }, [])

    // clasname "modal" for any interactable element
    return (
        <>
            {actualItem ?
                <Spinner4 />
                :
                <>
                    <div className="flex flex-col w-screen h-screen m-0">
                        <section className="flex flex-row justify-end items-center w-full h-[5%] mt-[1%] m-0">
                            <button
                                className="modal hover:scale-125 transition-all p-2"
                                onClick={() => {
                                    dispatch(setImageViewAction({ show: false }));
                                    dispatch(setFileViewAction({ file: undefined }));
                                    onDismiss()
                                }}
                            >
                                <img src={downloadicon} className="h-[29px]"></img>
                            </button>
                            <button
                                className="modal hover:scale-125 transition-all p-3"
                                onClick={() => {
                                    dispatch(setImageViewAction({ show: false }));
                                    dispatch(setFileViewAction({ file: undefined }));
                                    onDismiss()
                                }}
                            >
                                <img src={zoominicon} className="h-[25px]"></img>
                            </button>
                            <button
                                className="modal hover:scale-125 transition-all p-3"
                                onClick={() => {
                                    dispatch(setImageViewAction({ show: false }));
                                    dispatch(setFileViewAction({ file: undefined }));
                                    onDismiss()
                                }}
                            >
                                <img src={zoomouticon} className="h-[25px]"></img>
                            </button>
                            <button
                                className="modal hover:scale-125 transition-all p-3"
                                onClick={() => {
                                    dispatch(setImageViewAction({ show: false }));
                                    dispatch(setFileViewAction({ file: undefined }));
                                    onDismiss()
                                }}
                            >
                                <img src={fullscreenicon1} className="h-[25px]"></img>
                            </button>
                            <button
                                className="modal hover:scale-125 transition-all p-4"
                                onClick={() => {
                                    dispatch(setImageViewAction({ show: false }));
                                    dispatch(setFileViewAction({ file: undefined }));
                                    onDismiss()
                                }}
                            >
                                <img src={thumbnailicon} className="h-[21px]"></img>
                            </button>
                            <button
                                className="modal hover:scale-125 transition-all p-3 mr-4"
                                onClick={() => {
                                    dispatch(setImageViewAction({ show: false }));
                                    dispatch(setFileViewAction({ file: undefined }));
                                    onDismiss()
                                }}
                            >
                                <img src={closeicon} className="h-[25px]"></img>
                            </button>
                        </section>
                        <figure className="w-full h-[79%] justify-center items-center bg-blue-500 m-0">

                        </figure>
                        <div className="flex flex-row gap-2 w-full justify-center items-center h-[15%] m-0">
                            {files.map((file) => {
                                return (
                                    <Thumbnail
                                        key={file.uid}
                                        uid={file.uid}
                                        name={file.name} 
                                        src={cache[file.uid] ? window.URL.createObjectURL(cache[file.uid]) : ""}
                                        selected={selectedShowFile?.uid === file.uid}
                                        files={files}
                                    />
                                )
                            }
                            )}
                        </div>
                    </div>
                </>
            }
        </>)
}