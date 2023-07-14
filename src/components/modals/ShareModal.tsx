import { useDispatch, useSelector } from "react-redux";
import { selectShowShareModal, setShowShareModal } from "../../features/storage/filesSlice";
import { useEffect, useState } from "react";
import { setLoading, setShowToast, setToastMessage } from "../../features/account/accountSlice";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FileDB, FileMetadata } from "../../types";
import { getFileSharedState, shareFile, unshareFile } from "../../requests/shareRequests";
import { AxiosError, AxiosResponse } from "axios";
import { baseName } from "../../constants";
import { logOut } from "../../requests/clientRequests";
import { NavigateFunction } from "react-router-dom";

//can be public, one time, address restricted, password restricted, temporary link or subscription

//share type interface:

interface ShareDetails {
    type: string;
    title: string;
    description?: string;
    state: string; //selected, enabled or disabled
}

interface ShareState {
    ID: number;
    CreatedAt: Date;
    DeletedAt?: Date;
    UpdatedAt?: Date;
    File: FileDB;
    fileID: number;
    PublishedFile: PublishedFile;
    publishedFileID: number;
    userAddress: string;
}

interface PublishedFile {
    ID: number;
    CreatedAt: Date;
    DeletedAt?: Date;
    UpdatedAt?: Date;
    File: FileDB;
    fileID: number;
    hash: string;
    metadata: FileMetadata;
}


const ShareModal = (props: { selectedFile: FileDB | null, navigate: NavigateFunction, currentPage: string }) => {
    const navigate = props.navigate;
    const currentPage = props.currentPage;
    const selectedFile: FileDB | null = props.selectedFile;
    const [fileSharedState, setFileSharedState] = useState<ShareState>();

    const dispatch = useDispatch();


    useEffect(() => {
        getFileSharedState(selectedFile?.ID).then((res: AxiosResponse | AxiosError | undefined) => {
            if ((res as AxiosResponse).status === 200) {
                res = res as AxiosResponse;
                //parse response data to ShareState
                const shareState = res.data as ShareState;
                setFileSharedState(shareState);

                // If the PublishedFile has a valid ID, consider it as "public" share type
                if (shareState.PublishedFile.ID !== 0) {
                    setSelectedShareTypes(prevTypes => [...prevTypes, "public"])
                }
            }
            if ((res as AxiosError).isAxiosError) {
                if ((res as AxiosError).response?.status === 404 || (res as AxiosError).response?.status === 503) {
                    return;
                }
                dispatch(setToastMessage((res as AxiosError).response?.data));
                dispatch(setShowToast(true));
            }
        }).catch(err => {
            if (!err.message.includes("Cannot read"))
            console.log(err.message)
            /*
            dispatch(setToastMessage(err.message));
            dispatch(setShowToast(true));
            */
        }
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const shareDetails: ShareDetails[] = [
        {
            type: "public",
            title: "Public",
            description: "Generate a public URL that anyone you share it to can access. This URL will be valid until you disable it. Deletion of the file from the entire Internet is not granted.",
            state: "enabled"
        },
        {
            type: "one-time",
            title: "One-time only",
            description: "Generate an obfuscated URL that can be accessed only once. Once visited, the URL will self-destroy.",
            state: "enabled"
        },
        {
            type: "address-restricted",
            title: "Address restricted",
            description: "Generate a URL that can be accessed only from a specific wallet address that has to be verified with a provider's signature.",
            state: "disabled"
        },
        {
            type: "password-protected",
            title: "Password protected",
            description: "Generate a URL that can be accessed only by providing a password. The password' hash will be stored in the blockchain and will be required to access the file.",
            state: "disabled"
        },
        {
            type: "temporary-link",
            title: "Temporary link",
            description: "Generate a URL that can be accessed only for a limited time. The URL will self-destroy after the time expires.",
            state: "disabled"
        },
        {
            type: "subscription",
            title: "Subscription based",
            description: "Not implememnted yet. This feature will allow you to generate a URL for the content that can be accessed only by paying a subscription.",
            state: "disabled"
        }
    ];



    const showShareModal = useSelector(selectShowShareModal);
    const [shareError, setShareError] = useState("");
    const [selectedShareTypes, setSelectedShareTypes] = useState<string[]>([]);

    const closeShareModal = () => {
        dispatch(setShowShareModal(!showShareModal));
        dispatch(setLoading(false))
    }

    const handleShareChange = (type: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
        const shareTypeObject = shareDetails.find(st => st.type === type);
        console.log(shareTypeObject)
        if (!shareTypeObject) {
            setShareError("Invalid share type");
        } else if (shareTypeObject.state === 'disabled') {
            setShareError("This share type is not available yet");
        } else {
            setShareError("");
            if (e.target.checked) {
                //handle sharing from shareRequests.ts
                shareFile(selectedFile, type).then((res) => {
                    //if res is AxiosResponse:
                    if ((res as AxiosResponse).status === 200) {
                        res = res as AxiosResponse;
                        const shareState = res?.data as ShareState;
                        setFileSharedState(shareState);
                        dispatch(setLoading(false));
                        dispatch(setToastMessage("File shared successfully"));
                        dispatch(setShowToast(true));
                    }
                    if ((res as AxiosError).isAxiosError) {
                        dispatch(setLoading(false));
                        dispatch(setToastMessage((res as AxiosError).response?.data));
                        dispatch(setShowToast(true));
                    }
                }).catch(err => {
                    setShareError(err.message);
                });

                setSelectedShareTypes(prevTypes => [...prevTypes, type]);
            } else {

                unshareFile(selectedFile, type).then(async (res) => {
                    //if res is AxiosResponse:
                    if ((res as AxiosResponse).status === 200) {
                        res = res as AxiosResponse;
                        const shareState = res?.data as ShareState;
                        setFileSharedState(shareState);
                        dispatch(setLoading(false));
                        dispatch(setToastMessage("File unshared successfully"));
                        dispatch(setShowToast(true));
                    }
                    if ((res as AxiosError).isAxiosError) {
                        await logOut(navigate, dispatch, currentPage)
                        dispatch(setLoading(false));
                        dispatch(setToastMessage((res as AxiosError).response?.data));
                        dispatch(setShowToast(true));
                    }
                }).catch(err => {
                    setShareError(err.message);
                    logOut(navigate, dispatch, currentPage)
                });
                setSelectedShareTypes(prevTypes => prevTypes.filter(t => t !== type))
            }
        }
    }
    /*
        //shareType useEffect listener
        useEffect(() => {
            if (selectedShareTypes.length > 0) {
                setShareError("");
            }
        }, [selectedShareTypes])
    */
    return (
        <>
            <div style={{ display: showShareModal ? "block" : "none" }} className="modal-backdrop show"></div>
            <div style={{ display: showShareModal ? "block" : "none" }} className="modal show fade" tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Share content</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" onClick={closeShareModal} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row input-group mb-3 p-3">
                                {shareDetails.map((sd, index) => {
                                    return (
                                        <div title={sd.description} className="col-12 form-check form-switch" key={index}>
                                            <input className="form-check-input" type="checkbox" id={`flexSwitch${sd.type}`} checked={selectedShareTypes.includes(sd.type)} onChange={handleShareChange(sd.type)} disabled={sd.state === "disabled"} />
                                            <label className="form-check-label" htmlFor={`flexSwitch${sd.type}`}><h6 className="display-6">{sd.title}</h6></label>
                                            <OverlayTrigger
                                                key={`tooltip-${index}`}
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tooltip-${index}`}>
                                                        {sd.description}
                                                    </Tooltip>
                                                }
                                            >
                                                <i className={`fas fa-thin fa-question-circle p-2 me-2`}></i>
                                            </OverlayTrigger>
                                            {sd.type === "public" && fileSharedState?.publishedFileID &&
                                                <div>
                                                    <label htmlFor="shareLink" className="form-label">Share link</label>
                                                    <input type="email" className="form-control mb-2" id="shareLink" aria-describedby="shareLink" value={`${window.location.origin + baseName}/#/shared/public/${fileSharedState?.PublishedFile.hash}`} readOnly />
                                                    <button className="btn btn-primary" onClick={() => window.open(`${window.location.origin + baseName}/#/shared/public/${fileSharedState?.PublishedFile.hash}`, '_blank')}>
                                                        <i className="fas fa-external-link-alt"></i> Go 
                                                    </button>
                                                </div>
                                            }
                                        </div>
                                    )
                                }
                                )}
                            </div>
                            {/* show share error in case it's not "" */}
                            {shareError && <div className="alert alert-danger" role="alert">{shareError}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default ShareModal;