import { FileDB } from "../../types"
import { downloadFile, logOut, viewFile } from '../../requests/clientRequests'
import { useState } from 'react'
import { parseISO } from 'date-fns'; // for parsing the date
import { DeleteModal } from "../modals/DeleteModal";
import { selectDisplayedFilesList, selectShowShareModal, setShowShareModal } from "../../features/storage/filesSlice";
import { useDispatch, useSelector } from "react-redux";
import { setShowToast, setToastMessage } from "../../features/account/accountSlice";
import { useNavigate } from "react-router-dom";
import ShareModal from "../modals/ShareModal";
import { fileIcons, viewableExtensions } from "../../helpers/fileConstants";





const FileComponent = (props: { deleteFileFromList: (file: FileDB | null) => void }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<FileDB | null>(null)
    const displayedFilesList = useSelector(selectDisplayedFilesList);
    const deleteFileFromList = props.deleteFileFromList
    const currentPage = "files";
    const showShareModal = useSelector(selectShowShareModal)

    return (
        <ul className="list-group">
            <DeleteModal selectedFile={selectedFile} deleteFileFromList={deleteFileFromList} />
            {showShareModal && <ShareModal selectedFile={selectedFile} navigate={navigate} currentPage={currentPage} />}
            {displayedFilesList && displayedFilesList.length !== 0 && displayedFilesList.map((file: FileDB) => {

                const date = parseISO(file.CreatedAt); // convert to Date object
                const formattedDate = date.toLocaleString(); // convert to string using local timezone

                //get the file extension
                const fileExtension = (file.metadata?.name.split('.').pop() || '').toLowerCase();



                // Get the file icon
                const fileIcon = (fileIcons as { [key: string]: string })[fileExtension] || 'fa-file';  // default to 'fa-file' if the extension is not found in the map

                const viewable = viewableExtensions.has(fileExtension); // check if the file is viewable

                const originalFilename = file?.metadata?.name
                let filename = file?.metadata?.name

                //if file?.metadata?.name is larger than 20 characters, truncate it (add "..." at the middle and put the extension at the end)
                if (file && file.metadata) {
                    if (file?.metadata?.name.length > 40) {
                        filename = file?.metadata?.name.slice(0, 10) + "..." + file?.metadata?.name.slice(file?.metadata?.name.length - 10, file?.metadata?.name.length)
                    }
                }

                return (
                    <li className="list-group-item" style={{ position: "initial" as const }} key={file.ID}>
                        <div className="d-flex justify-content-between align-items-center">

                            <div className="w-100 d-flex align-items-center justify-content-between" title={originalFilename}>
                                <i className={`fas fa-regular ${fileIcon} fa-2x me-2`}></i>
                                <p className="mb-0 text-truncate text-start align-self-left w-100 text-dark mr-2">{filename}</p>
                                <span className="badge bg-white text-dark m-2" >{formattedDate}</span>
                            </div>
                            <div className="dropdown" style={{ position: "initial" as const }}>
                                <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                                </button>
                                <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                                    <li><a className="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setSelectedFile(file)} href="#">Delete</a></li>
                                    <li><a className="dropdown-item" role="button" onClick={async () => await downloadFile(file, 'original')}>Download</a></li>

                                    <li><a className={viewable ? "dropdown-item" : "disabled dropdown-item"} role="button" onClick={async () => await viewFile(file, "original").catch((e) => {
                                        logOut(navigate, dispatch, currentPage);
                                        dispatch(setToastMessage(e));
                                        dispatch(setShowToast(true));
                                    })}>View</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" role="button" onClick={() => { setSelectedFile(file), dispatch(setShowShareModal(true)) }}>Share</a></li>
                                </ul>
                            </div>
                        </div>
                    </li>
                )
            })}
        </ul>
    )
}

export default FileComponent