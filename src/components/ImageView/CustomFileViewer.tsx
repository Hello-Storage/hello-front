import { File as FileType } from "api";
import { useModal } from "components/Modal";
import { Spinner4 } from "components/Spinner";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useAppSelector } from "state";
import { PreviewImage, setFileViewAction, setImageViewAction } from "state/mystorage/actions";

import unknownFileType from "../../assets/images/file-viewer-resources/file-unknow.svg";
import closeicon from "../../assets/images/file-viewer-resources/close-btn.svg";
import downloadicon from "../../assets/images/file-viewer-resources/download-btn.svg";
import fullscreenicon1 from "../../assets/images/file-viewer-resources/fullscreen-1.svg";
import thumbnailicon from "../../assets/images/file-viewer-resources/thumbnail-btn.svg";
import zoominicon from "../../assets/images/file-viewer-resources/zoom-in.svg";
import zoomouticon from "../../assets/images/file-viewer-resources/zoom-out.svg";
import { Thumbnail } from "./components/Thumbnail";
import { handleFullScreen, handleThumbnail } from "./utils/functions";
import { imageExtensions, otherExtensions, textFileExtensions, videoExtensions } from "./utils/consts";
import { Theme } from "state/user/reducer";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { downloadSingleFile, viewMultipart } from "utils/filesDownload";
import { setUploadStatusAction } from "state/uploadstatus/actions";

interface CustomFileViewerProps {
    files: FileType[];
}


const MULTIPART_THRESHOLD = import.meta.env.VITE_MULTIPART_THRESHOLD || 1073741824; // 1GiB

export const CustomFileViewer: React.FC<CustomFileViewerProps> = ({ files }) => {
    const [, onDismiss] = useModal(<></>);
    const [actualItem, setActualItem] = useState<PreviewImage>();
    const { selectedShowFile, cache, cancelSources } = useAppSelector((state) => state.mystorage);
    const fileExtension = selectedShowFile?.name.split('.').pop() ?? ''
    const [viewable, setviewable] = useState(true)
    // video ref
    const videoRef = useRef<HTMLVideoElement>(null);
    //error
    const [error, setError] = useState("Unknown error");

    const dispatch = useDispatch();
    //state for loading
    const [loading, setLoading] = useState(false);
    //state for scale
    const [scale, setScale] = useState(1);

    const downloadAndProcessFile = async (
        file: FileType
    ) => {
        try {
            let mediaItem: PreviewImage;
            if (file.size >= MULTIPART_THRESHOLD) {
                viewMultipart(file, dispatch, videoRef)

                mediaItem = {
                    type: "video",
                    src: "",
                    alt: file.name,
                };

                return mediaItem;
            } else {
                const blob = await downloadSingleFile(file, cache, dispatch);
                if (!blob) {
                    return
                }

                const url = window.URL.createObjectURL(blob);

                // Process downloaded file based on MIME type
                if (videoExtensions.includes(fileExtension)) {
                    // Handle video files
                    mediaItem = {
                        type: "video",
                        src: url,
                        alt: file.name,
                    };
                } else {
                    // Handle other file types
                    mediaItem = {
                        type: imageExtensions.includes(fileExtension) ? "image" : "other",
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
            if (selectedShowFile.size >= MULTIPART_THRESHOLD
                // TODO: add support for video streaming
                // && !videoExtensions.includes(fileExtension)
            ) {
                setviewable(false)
                setActualItem({
                    type: "other",
                    src: "",
                    alt: selectedShowFile.name,
                });
                setLoading(false);
                setError("File size too large for preview")
            }
            else if (!textFileExtensions.includes(fileExtension) &&
                !imageExtensions.includes(fileExtension) &&
                !videoExtensions.includes(fileExtension) &&
                !otherExtensions.includes(fileExtension)
            ) {
                setviewable(false)
                setActualItem({
                    type: "other",
                    src: "",
                    alt: selectedShowFile.name,
                });
                setLoading(false);
                setError("File type not supported for preview")
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
            try {
                cancelSources[selectedShowFile.uid].cancel();
            } catch (error) {
                //the previous download was not cancelled (likely because it was already cancelled)
                console.log(":) Don't worry, she will come back (or not, but there's more womans in the world than stars in the sky)");
            }
            dispatch(
                setUploadStatusAction({
                    uploading: false,
                })
            );
            files.indexOf(selectedShowFile) < files.length - 1 ?
                dispatch(setFileViewAction({ file: files[files.indexOf(selectedShowFile) + 1] }))
                : dispatch(setFileViewAction({ file: files[0] }))
        }
    }

    function handlePrevious() {
        if (selectedShowFile) {
            try {
                cancelSources[selectedShowFile.uid].cancel();
            } catch (error) {
                console.log("you are 15,500,000,000 bigger than a hydrogen atom :0");
            }
            dispatch(
                setUploadStatusAction({
                    uploading: false,
                })
            );
            files.indexOf(selectedShowFile) > 0 ?
                dispatch(setFileViewAction({ file: files[files.indexOf(selectedShowFile) - 1] }))
                : dispatch(setFileViewAction({ file: files[files.length - 1] }))
        }
    }

    const { theme } = useAppSelector((state) => state.user);

    return (
        <div className="flex flex-col w-screen h-screen m-0">
            <section className="flex flex-row justify-end items-center w-full h-[5%] mt-[1%] m-0 action-btns-file-viewer
                ">
                {viewable &&
                    <button
                        className="modal hover:scale-125 transition-all p-2"
                        onClick={() => { handleDownload(actualItem?.src as string, selectedShowFile?.name as string) }}
                    >
                        <img src={downloadicon} className="h-[29px]" alt="download"></img>
                    </button>
                }

                <button
                    className="modal hover:scale-125 transition-all p-[10px]"
                    onClick={handleZoomIn}
                >
                    <img src={zoominicon} className="h-[25px]" alt="zoom in"></img>
                </button>
                <button
                    className="modal hover:scale-125 transition-all p-[10px]"
                    onClick={handleZoomOut}
                >
                    <img src={zoomouticon} className="h-[25px]" alt="zoom out"></img>
                </button>
                <button
                    className="modal hover:scale-125 transition-all p-[10px]"
                    onClick={() => {
                        handleFullScreen()
                        setScale(1)
                    }}
                >
                    <img src={fullscreenicon1} id="fulls-icon" className="h-[25px]" alt="fullscreen"></img>
                </button>
                <button
                    className="modal hover:scale-125 transition-all p-[12px]"
                    onClick={handleThumbnail}
                >
                    <img src={thumbnailicon} className="h-[21px]" alt="thumbnail"></img>
                </button>
                <button
                    className="modal hover:scale-125 transition-all p-[10px] mr-4"
                    onClick={() => {
                        dispatch(setImageViewAction({ show: false }));
                        dispatch(setFileViewAction({ file: undefined }));
                        onDismiss()
                    }}
                >
                    <img src={closeicon} className="h-[25px]" alt="close"></img>
                </button>
            </section>
            <figure className="flex w-full image-preview-content p-5 justify-center items-center m-0" id="image-preview-content">
                <button className="arroy-left-fv"
                    onClick={handlePrevious}
                >
                    <MdKeyboardArrowLeft />
                </button>
                {/* if actualItem is not null show the actual item */}
                {actualItem ?
                    // if it is an image
                    actualItem.type === "image" ?
                        <img src={actualItem.src} alt={actualItem.alt} id="image-file-viewer"
                            style={{
                                transform: `scale(${scale})`
                            }}
                            className="max-h-[93%] w-full modal object-contain transition-all" />
                        :
                        // else, if it is a video
                        actualItem.type === "video" ?
                            <video ref={videoRef} controls className="max-h-[93%] w-[85%] modal object-contain rounded-xl" >
                                <track kind="captions" />
                                <source src={actualItem.src} type="video/mp4" />
                            </video>
                            :
                            // else, if it is a text file
                            textFileExtensions.includes(fileExtension) ?
                                <object data={actualItem.src} type="text/plain"
                                    id="text-file-viewer"
                                    className="h-full w-[85%] modal object-contain rounded-xl bg-white text-black"
                                >
                                    <p>Error loading file</p>
                                </object>
                                :
                                // else, if it is an especific implemented file type
                                otherExtensions.includes(fileExtension) ?
                                    <>
                                        {/* if the especific implemented file type is pdf */}
                                        {fileExtension === "pdf" ?
                                            <object data={actualItem.src} type="application/pdf"
                                                className="h-full w-[85%] modal object-contain rounded-xl"
                                            >
                                                <p>Error loading pdf</p>
                                            </object>
                                            :
                                            // else, it is other file type on the otherExtensions array, so must be implemented in the future
                                            <> </>
                                        }
                                    </>
                                    :
                                    // else, if it is an unknown file type
                                    <div className={"p-5 rounded-lg flex justify-center items-center flex-col modal fl " + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}>
                                        <img src={unknownFileType} alt="err" height="100px" width="100px" />
                                        <br />
                                        <span className="text-2xl font-bold">{error}</span>
                                    </div>
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
                                name={file.name}
                                src={cache[file.uid] ? window.URL.createObjectURL(cache[file.uid]) : ""}
                                selected={selectedShowFile?.uid === file.uid}
                                files={files}
                                CancelToken={selectedShowFile ? cancelSources[selectedShowFile.uid] : undefined}
                            />
                        )
                    }
                    )}
                </div>
            </section>
        </div>
    )
}