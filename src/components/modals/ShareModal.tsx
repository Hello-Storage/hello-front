import { useDispatch, useSelector } from "react-redux";
import { selectShowShareModal, setShowShareModal } from "../../features/storage/filesSlice";
import { useState } from "react";
import { setLoading } from "../../features/account/accountSlice";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FileDB } from "../../types";


//can be public, one time, address restricted, password restricted, temporary link or subscription

//share type interface:

interface ShareType {
    type: string;
    title: string;
    description?: string;
    state: string; //selected, enabled or disabled
}

const ShareModal = (props: { selectedFile: FileDB | null }) => {
    const selectedFile: FileDB | null = props.selectedFile;

    const dispatch = useDispatch();

    const shareTypes: ShareType[] = [
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
            type: "password-restricted",
            title: "Password restricted",
            description: "Generate a URL that can be accessed only by providing a password. The password' hash will be stored in the blockchain and will be required to access the file.",
            state: "disabled"
        },
        {
            title: "temporary-link",
            type: "Temporary link",
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
    const [shareType, setShareType] = useState("");

    const closeShareModal = () => {
        dispatch(setShowShareModal(!showShareModal));
        dispatch(setLoading(false))
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleShareChange = (type: string) => (_e: React.ChangeEvent<HTMLInputElement>) => {
        const shareTypeObject = shareTypes.find(st => st.type === type);

        if (!shareTypeObject) {
            setShareError("Invalid share type");
        } else if (shareTypeObject.state === 'disabled') {
            setShareError("This share type is not available yet");
        } else {
            setShareError("");
            setShareType(type);
        }
    }

    //shareType useEffect lisstener

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
                                {shareTypes.map((st, index) => {
                                    return (
                                        <div title={st.description} className="col-12 form-check form-switch" key={index}>
                                            <input className="form-check-input" type="checkbox" id={`flexSwitch${st.type}`} checked={st.type === shareType} onChange={handleShareChange(st.type)} disabled={st.state === "disabled"} />
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