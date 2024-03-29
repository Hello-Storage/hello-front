import { Api, EncryptionStatus, File } from "api";
import { AxiosProgressEvent } from "axios";
import { useModal } from "components/Modal";
import { Spinner4 } from "components/Spinner";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useAppSelector } from "state";
import { PreviewImage, addCache, setFileViewAction, setImageViewAction } from "state/mystorage/actions";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { blobToArrayBuffer, decryptFileBuffer } from "utils/encryption/filesCipher";

import unknownFileType from "../../assets/images/file-viewer-resources/file-unknow.svg";
import closeicon from "../../assets/images/file-viewer-resources/close-btn.svg";
import downloadicon from "../../assets/images/file-viewer-resources/download-btn.svg";
import fullscreenicon1 from "../../assets/images/file-viewer-resources/fullscreen-1.svg";
import thumbnailicon from "../../assets/images/file-viewer-resources/thumbnail-btn.svg";
import zoominicon from "../../assets/images/file-viewer-resources/zoom-in.svg";
import zoomouticon from "../../assets/images/file-viewer-resources/zoom-out.svg";
import { Thumbnail } from "./components/Thumbnail";
import { handleFullScreen, handleThumbnail } from "./utils/functions";
import { textFileExtensions } from "./utils/consts";
import { Theme } from "state/user/reducer";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

interface CustomFileViewerProps {
    files: File[];
}

export const CustomFileViewer: React.FC<CustomFileViewerProps> = ({ files }) => {
    const [, onDismiss] = useModal(<></>);
    const [actualItem, setActualItem] = useState<PreviewImage>();
    const { selectedShowFile, cache } = useAppSelector((state) => state.mystorage);
    const fileExtension = selectedShowFile?.name.split('.').pop() || ''
    const [viewable, setviewable] = useState(true)
    const dispatch = useDispatch();
    //state for loading
    const [loading, setLoading] = useState(false);
    //state for scale
    const [scale, setScale] = useState(1);


    const downloadAndProcessFile = async (
        file: File
    ) => {
        try {
            // Check if the file is already in the cache
            const blob = cache[file.uid];
            if (!(blob instanceof Blob)) {
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
                dispatch(addCache({ [file.uid]: blob }));

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


    // Update download status
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

    // Download the file
    function handleDownload(url: string, name: string) {
        if (!loading) {
            if (!url) {
                return;
            }
            if (!name) {
                name = "file";
            }
            const a = document.createElement("a");
            a.href = url;
            a.download = name; // Set the file name
            a.click(); // Trigger the download
            toast.success("Download complete!");
        }
    }

    // Zoom in the file
    function handleZoomIn() {
        setScale((scale) => {
            if (scale < 1.4) {
                return scale + 0.1;
            }
            return scale;
        });
    }

    // Zoom out the file
    function handleZoomOut() {
        setScale((scale) => {
            if (scale >= 0.5) {
                return scale - 0.1;
            }
            return scale;
        });
    }


    // Add event handler for escape key to close the viewer
    const handleKeyDown = (event: any) => {
        if (event.keyCode === 27) {
            dispatch(setImageViewAction({ show: false }));
            dispatch(setFileViewAction({ file: undefined }));
            onDismiss();
        }
    };

    // Add event listener for escape key to close the viewer
    useEffect(() => {
        dispatch(setImageViewAction({ show: false }));
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [])

    // When the selected file changes, download and process it
    useEffect(() => {
        if (selectedShowFile) {
            setActualItem(undefined);
            setLoading(true);
            setviewable(true)
            if (
                !textFileExtensions.includes(fileExtension) &&
                fileExtension !== "pdf" &&
                !selectedShowFile.mime_type.startsWith("image/") &&
                !selectedShowFile.mime_type.startsWith("video/")
            ) {
                setviewable(false)
                setActualItem({
                    type: "other",
                    src: "",
                    alt: selectedShowFile.name,
                });
                setLoading(false);
            } else {
                downloadAndProcessFile(selectedShowFile).then((mediaItem) => {
                    if (!mediaItem) {
                        return;
                    }
                    setActualItem(mediaItem);
                    setLoading(false);
                });
            }
        }
    }, [selectedShowFile]);

    //change the size of the text files
    useEffect(() => {
        if (textFileExtensions.includes(fileExtension) && actualItem) {
            const textFileViewer = document.getElementById("text-file-viewer");
            const x = setInterval(() => {
                if (textFileViewer) {
                    const objectDocument = (textFileViewer as any).contentDocument || (textFileViewer as any).contentWindow.document
                    objectDocument.body.style.fontSize = scale + "rem";
                    clearInterval(x);
                }
            }, 100);
        }
    }, [actualItem, scale]);

    // Add event listener for mouse wheel to zoom in and out
    //TODO: using react-gesture-responder make it work on mobile
    useEffect(() => {
        // Handle zoom in and out with mouse wheel
        const handleScroll = (event: any) => {
            if (event.deltaY < 0) {
                handleZoomIn();
            } else {
                handleZoomOut();
            }
        };

        const scrollableElement = document.getElementById('image-preview-content');

        if (scrollableElement) {
            scrollableElement.addEventListener('wheel', handleScroll);
        }

        return () => {
            if (scrollableElement) {
                scrollableElement.removeEventListener('wheel', handleScroll);
            }
        };
    }, []);

    function handleNext() {
        if (selectedShowFile) {
            files.indexOf(selectedShowFile) < files.length - 1 ?
                dispatch(setFileViewAction({ file: files[files.indexOf(selectedShowFile) + 1] }))
                : dispatch(setFileViewAction({ file: files[0] }))
        }
    }

    function handlePrevious() {
        if (selectedShowFile) {
            files.indexOf(selectedShowFile) > 0 ?
                dispatch(setFileViewAction({ file: files[files.indexOf(selectedShowFile) - 1] }))
                : dispatch(setFileViewAction({ file: files[files.length - 1] }))
        }
    }

    const { theme } = useAppSelector((state) => state.user);

    return (
        <>
            <div className="flex flex-col w-screen h-screen m-0">
                <section className="flex flex-row justify-end items-center w-full h-[5%] mt-[1%] m-0 action-btns-file-viewer
                ">
                    {viewable &&
                        <button
                            className="modal hover:scale-125 transition-all p-2"
                            onClick={() => { handleDownload(actualItem?.src as string, selectedShowFile?.name as string) }}
                        >
                            <img src={downloadicon} className="h-[29px]"></img>
                        </button>
                    }

                    <button
                        className="modal hover:scale-125 transition-all p-[10px]"
                        onClick={handleZoomIn}
                    >
                        <img src={zoominicon} className="h-[25px]"></img>
                    </button>
                    <button
                        className="modal hover:scale-125 transition-all p-[10px]"
                        onClick={handleZoomOut}
                    >
                        <img src={zoomouticon} className="h-[25px]"></img>
                    </button>
                    <button
                        className="modal hover:scale-125 transition-all p-[10px]"
                        onClick={() => {
                            handleFullScreen()
                            setScale(1)
                        }}
                    >
                        <img src={fullscreenicon1} id="fulls-icon" className="h-[25px]"></img>
                    </button>
                    <button
                        className="modal hover:scale-125 transition-all p-[12px]"
                        onClick={handleThumbnail}
                    >
                        <img src={thumbnailicon} className="h-[21px]"></img>
                    </button>
                    <button
                        className="modal hover:scale-125 transition-all p-[10px] mr-4"
                        onClick={() => {
                            dispatch(setImageViewAction({ show: false }));
                            dispatch(setFileViewAction({ file: undefined }));
                            onDismiss()
                        }}
                    >
                        <img src={closeicon} className="h-[25px]"></img>
                    </button>
                </section>
                <figure className="flex w-full image-preview-content p-5 justify-center items-center m-0" id="image-preview-content">
                    <button className="arroy-left-fv"
                        onClick={handlePrevious}
                    >
                        <MdKeyboardArrowLeft />
                    </button>
                    {actualItem ?
                        actualItem.type === "image" ?
                            <img src={actualItem.src} alt={actualItem.alt} id="image-file-viewer"
                                style={{
                                    transform: `scale(${scale})`
                                }}
                                className="max-h-[93%] w-full modal object-contain transition-all" />
                            :
                            actualItem.type === "video" ?
                                <video controls className="max-h-[93%] w-[85%] modal object-contain rounded-xl" >
                                    <source src={actualItem.src} type="video/mp4" />
                                </video>
                                :
                                <>
                                    {fileExtension === "pdf" ?
                                        <object data={actualItem.src} type="application/pdf"
                                            className="h-full w-[85%] modal object-contain rounded-xl"
                                        >
                                            <p>Error loading pdf</p>
                                        </object>
                                        :
                                        <>
                                            {textFileExtensions.includes(fileExtension) ?
                                                <object data={actualItem.src} type="text/plain"
                                                    id="text-file-viewer"
                                                    className="h-full w-[85%] modal object-contain rounded-xl bg-white text-black"
                                                >
                                                    <p>Error loading file</p>
                                                </object>
                                                :
                                                <div className={"p-5 rounded-lg flex justify-center items-center flex-col modal fl " + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
                                                    <img src={unknownFileType} alt="err" height="100px" width="100px" />
                                                    <br />
                                                    <span className="text-2xl font-bold">File type not supported for preview</span>
                                                </div>
                                            }
                                        </>
                                    }
                                </>
                        :
                        <Spinner4 />
                    }
                    <button className="arroy-right-fv"
                        onClick={handleNext}
                    >
                        <MdKeyboardArrowRight />
                    </button>
                </figure>
                <section className="thumbnails flex items-center justify-center m-0" id="thumbnails" >
                    <div className="flex flex-row gap-2 px-5 custom-scrollbar items-center h-full m-0 overflow-auto modal">
                        {files.map((file) => {
                            return (
                                <Thumbnail
                                    key={file.uid}
                                    uid={file.uid}
                                    loading={loading}
                                    name={file.name}
                                    src={cache[file.uid] ? window.URL.createObjectURL(cache[file.uid]) : ""}
                                    selected={selectedShowFile?.uid === file.uid}
                                    files={files}
                                />
                            )
                        }
                        )}
                    </div>
                </section>
            </div>
        </>
    )
}