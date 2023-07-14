import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { setSelectedPage, setShowToast, setToastMessage } from "../../features/account/accountSlice";
import { isSignedIn } from "../../helpers/userHelper";
import { useEffect, useState } from "react";
import { FileDB, FileMetadata, PublishedFile } from "../../types";
import { getPublishedFile } from "../../requests/shareRequests";
import { AxiosError, AxiosResponse } from "axios";
import { formatByteWeight } from "../../helpers/storageHelper";
import { downloadFile, viewFile } from "../../requests/clientRequests";
import { fileIcons, viewableExtensions } from "../../helpers/fileConstants";
import { parseISO } from "date-fns";

const currentPage = "shared"




const Shared = (props: { shareType: string }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const shareType = props.shareType;
    //get the hash from the :hash param
    const hash = useParams().hash;

    dispatch(setSelectedPage(`${currentPage}/${props.shareType}/${hash}`));

    const [publishedFile, setPublishedFile] = useState<PublishedFile>();
    const [metadata, setMetadata] = useState<FileMetadata>();

    useEffect(() => {
        if (!isSignedIn(navigate, currentPage)) {
            return;
        }

        //get file metadata from the hash
        switch (shareType) {
            case "public":
                //get file metadata from the hash
                if (hash && hash.length > 0)
                    getPublishedFile(hash).then((res) => {
                        if ((res as AxiosResponse).status === 200) {
                            res = res as AxiosResponse
                            const publishedFile = res.data as PublishedFile;
                            publishedFile.metadata = JSON.parse(publishedFile.metadata as unknown as string) as FileMetadata;
                            setPublishedFile(publishedFile);
                            setMetadata(res.data.metadata);
                        }

                        if ((res as AxiosError).isAxiosError) {
                            if ((res as AxiosError).response?.status === 404 || (res as AxiosError).response?.status === 503) {
                                return;
                            }
                            dispatch(setToastMessage((res as AxiosError).response?.data));
                            dispatch(setShowToast(true));
                        }
                    }).catch((err) => {
                        dispatch(setToastMessage(err.message));
                        dispatch(setShowToast(true));
                    });

                break;
            case "private":
                //get file metadata from the hash
                if (hash && hash.length > 0)
                    alert("private")
                break;
            default:
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const downloadHandler = () => {
        switch (shareType) {
            case "public":
                //get file metadata from the hash
                if (hash && hash.length > 0)
                    downloadFile(publishedFile as unknown as FileDB, 'public')
                break;
            case "private":
                //get file metadata from the hash
                if (hash && hash.length > 0)
                    return () => alert("private")
                break;
            default:
                return () => { "" };
        }
    }

    const creationDate = publishedFile?.CreatedAt ? parseISO(publishedFile.CreatedAt.toString()) : undefined; // convert to Date object
    const formattedCreationDate = creationDate?.toLocaleString(); // convert to string using local timezone


    //get the file extension
    const fileExtension = (metadata?.name.split('.').pop() || '').toLowerCase();



    // Get the file icon
    const fileIcon = (fileIcons as { [key: string]: string })[fileExtension] || 'fa-file';  // default to 'fa-file' if the extension is not found in the map

    const viewable = viewableExtensions.has(fileExtension); // check if the file is viewable

    return (
        <div className="container z-index-0 position-relative d-block" >
            <div className="container mt-5">
                <div className="card">
                    <div className="card-header">
                        <h2>
                            {viewable && <i className={`fas fa-regular ${fileIcon} m-2`}></i>}
                            {shareType.toUpperCase()} File
                        </h2>
                    </div>
                    <div className="card-body">
                        <table className="table table-striped">
                            <tbody>
                                <tr>
                                    <th>Name</th>
                                    <td id="fileName">{metadata?.name}</td>
                                </tr>
                                <tr>
                                    <th>Type</th>
                                    <td id="fileType">{metadata?.type}</td>
                                </tr>
                                <tr>
                                    <th>Size</th>
                                    <td id="fileSize">{metadata?.size ? formatByteWeight(metadata.size) : ''}</td>
                                </tr>
                                <tr>
                                    <th>Last Modified</th>
                                    <td id="lastModified">{metadata?.lastModified ? new Date(metadata.lastModified).toString() : ''}</td>
                                </tr>
                                <tr>
                                    <th>Created At</th>
                                    <td id="createdAt">{formattedCreationDate}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    <div className="card-footer d-flex align-self-center justify-content-center w-100">
                        <a onClick={() => downloadHandler()} target="_blank" rel="noreferrer" className="btn btn-primary m-2">Download</a>
                        {viewable && <button onClick={() => viewFile(publishedFile as unknown as FileDB, "public")} className="btn btn-primary m-2"><i className="fas fa-eye"></i> View</button>}
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Shared;