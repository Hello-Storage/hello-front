import { useDispatch, useSelector } from "react-redux";
import { selectShowShareModal, setShowShareModal } from "../../features/storage/filesSlice";
import { useEffect, useState } from "react";
import { setLoading, setShowToast, setToastMessage } from "../../features/account/accountSlice";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FileDB } from "../../types";
import { getFileSharedState, shareFile, unshareFile } from "../../requests/shareRequests";
import { AxiosError, AxiosResponse } from "axios";

//can be public, one time, address restricted, password restricted, temporary link or subscription

//share type interface:

interface ShareDetails {
    type: string;
    title: string;
    description?: string;
    state: string; //selected, enabled or disabled
}

interface ShareState {
    public: boolean;
    oneTime: boolean;
    addressRestricted: boolean;
    passwordRestricted: boolean;
    temporaryLink: boolean;
    subscription: boolean;
}

const ShareModal = (props: { selectedFile: FileDB | null }) => {
    const selectedFile: FileDB | null = props.selectedFile;
    const [fileSharedState, setFileSharedState] = useState<ShareState>();

    const dispatch = useDispatch();


    useEffect(() => {
        getFileSharedState(selectedFile?.ID).then((res: AxiosResponse | AxiosError | undefined) => {
            if ((res as AxiosResponse).status === 200) {
                setFileSharedState((res as AxiosResponse).data);
            }
            if ((res as AxiosError).isAxiosError) {
                if ((res as AxiosError).response?.status === 404) {
                    return;
                }
                dispatch(setToastMessage((res as AxiosError).response?.data));
                dispatch(setShowToast(true));
            }
        }).catch(err => {
            dispatch(setToastMessage(err.message));
            dispatch(setShowToast(true));
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
            state: "disabled"
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
                console.log("unshare")
                
                unshareFile(selectedFile, type).then((res) => {
                    //if res is AxiosResponse:
                    if ((res as AxiosResponse).status === 200) {
                        dispatch(setLoading(false));
                        dispatch(setToastMessage("File unshared successfully"));
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
            <p>{fileSharedState?.public}</p>
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
                                {shareDetails.map((st, index) => {
                                    return (
                                        <div title={st.description} className="col-12 form-check form-switch" key={index}>
                                            <input className="form-check-input" type="checkbox" id={`flexSwitch${st.type}`} checked={selectedShareTypes.includes(st.type)} onChange={handleShareChange(st.type)} disabled={st.state === "disabled"} />
                                            <label className="form-check-label" htmlFor={`flexSwitch${st.type}`}><h6 className="display-6">{st.title}</h6></label>
                                            <OverlayTrigger
                                                key={`tooltip-${index}`}
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tooltip-${index}`}>
                                                        {st.description}
                                                    </Tooltip>
                                                }
                                            >
                                                <i className={`fas fa-thin fa-question-circle p-2 me-2`}></i>
                                            </OverlayTrigger>
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