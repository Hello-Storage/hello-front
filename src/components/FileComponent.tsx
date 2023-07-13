import { FileDB } from "../types"
import { downloadFile, logOut, viewFile } from '../requests/clientRequests'
import { useState } from 'react'
import { parseISO } from 'date-fns'; // for parsing the date
import { DeleteModal } from "./modals/DeleteModal";
import { selectDisplayedFilesList, selectShowShareModal, setShowShareModal } from "../features/storage/filesSlice";
import { useDispatch, useSelector } from "react-redux";
import { setShowToast, setToastMessage } from "../features/account/accountSlice";
import { useNavigate } from "react-router-dom";
import ShareModal from "./modals/ShareModal";





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

                // Create a map of file extensions to their corresponding icons
                const fileIcons = { pdf: 'fa-file-pdf', png: 'fa-file-image', jpg: 'fa-file-image', jpeg: 'fa-file-image', doc: 'fa-file-word', docx: 'fa-file-word', xls: 'fa-file-excel', xlsx: 'fa-file-excel', ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint', zip: 'fa-file-archive', rar: 'fa-file-archive', mp3: 'fa-file-audio', wav: 'fa-file-audio', mp4: 'fa-file-video', avi: 'fa-file-video', mov: 'fa-file-video', txt: 'fa-file-alt', js: 'fa-file-code', ts: 'fa-file-code', py: 'fa-file-code', java: 'fa-file-code', c: 'fa-file-code', cpp: 'fa-file-code', cs: 'fa-file-code', go: 'fa-file-code', php: 'fa-file-code', html: 'fa-file-code', css: 'fa-file-code', key: 'fa-key', dll: 'fa-wrench', apk: 'fa-file-code', exe: 'fa-file-code', iso: 'fa-file-code', dmg: 'fa-file-code', json: 'fa-file-code', csv: 'fa-file-code', xml: 'fa-file-code', svg: 'fa-file-code', ttf: 'fa-file-code', woff: 'fa-file-code', woff2: 'fa-file-code', eot: 'fa-file-code', otf: 'fa-file-code', md: 'fa-file-code', yml: 'fa-file-code', yaml: 'fa-file-code', sh: 'fa-file-code', bat: 'fa-file-code', bin: 'fa-file-code', ps1: 'fa-file-code', vbs: 'fa-file-code', cmd: 'fa-file-code', jar: 'fa-file-code', sql: 'fa-file-code' };

                // Create a set of viewable file extensions
                const viewableExtensions = new Set(['html', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'ico', 'mp4', 'webm', 'ogg', 'mp3', 'wav', 'txt', 'csv', 'md', 'xml', 'js', 'json', 'css', 'pdf']);


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
                                    <li><a className="dropdown-item" role="button" onClick={async () => await downloadFile(file)}>Download</a></li>

                                    <li><a className={viewable ? "dropdown-item" : "disabled dropdown-item"} role="button" onClick={async () => await viewFile(file).catch((e) => {
                                        logOut(navigate, dispatch, currentPage);
                                        dispatch(setToastMessage(e));
                                        dispatch(setShowToast(true));
                                    })}>View</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" role="button" onClick={() => {setSelectedFile(file), dispatch(setShowShareModal(true))}}>Share</a></li>
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