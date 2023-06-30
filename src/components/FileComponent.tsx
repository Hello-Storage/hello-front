import { FileDB } from "../types"
import { deleteFile, downloadFile, viewFile } from '../requests/clientRequests.ts'
import { useState } from 'react'
import { AxiosResponse } from "axios"
import { parseISO } from 'date-fns'; // for parsing the date



export const DeleteModal = (props: { selectedFile: FileDB | null, deleteFileFromList: (file: FileDB | null) => void }) => {
    const selectedFile: FileDB | null = props.selectedFile

    return (
        <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Delete {selectedFile?.metadata!.name}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        Are you sure you want to delete this file?
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">No</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => deleteFile(selectedFile).then((res: AxiosResponse<unknown, unknown> | null) => {
                            if (res?.status === 200) {
                                props.deleteFileFromList(selectedFile)
                            }
                        })}>Yes</button>
                    </div>
                </div>
            </div>
        </div>
    )

}




const FileComponent = (props: { displayedFilesList: FileDB[], deleteFileFromList: (file: FileDB | null) => void }) => {
    const [selectedFile, setSelectedFile] = useState<FileDB | null>(null)

    const displayedFilesList: FileDB[] = props.displayedFilesList
    const deleteFileFromList = props.deleteFileFromList
    return (
        <ul className="list-group">
            <DeleteModal selectedFile={selectedFile} deleteFileFromList={deleteFileFromList} />
            {displayedFilesList.map((file: FileDB) => {
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

                //if file?.metadata?.name is larger than 20 characters, truncate it
                if (file && file.metadata) {
                    if (file?.metadata?.name.length > 20) {
                        file.metadata.name = file?.metadata?.name.substring(0, 20) + "..."
                    }
                }

                return (
                    <li className="list-group-item" style={{position: "initial" as const}}  key={file.ID}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="w-100 d-flex align-items-center justify-content-between">
                                <i className={`fas fa-regular ${fileIcon} fa-2x me-2`}></i>

                                <p className="mb-0 text-truncate text-dark mr-2">{file?.metadata?.name}</p>
                                {/* Display the formatted date in a Bootstrap badge */}
                                <span className="badge bg-white text-dark m-2" >{formattedDate}</span>
                            </div>
                            <div className="dropdown"style={{position: "initial" as const}}>
                                <button className="btn btn-secondary dropdown-toggle"  type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                                </button>
                                <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                                    <li><a className="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setSelectedFile(file)} href="#">Delete</a></li>
                                    <li><a className="dropdown-item" role="button" onClick={async () => await downloadFile(file)}>Download</a></li>

                                    <li><a className={viewable ? "dropdown-item" : "disabled dropdown-item"} role="button" onClick={async () => await viewFile(file)}>View</a></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    {/*
                                    share function will give out the cid of the original file,
                                    and will get a special link
                                    that will allow the user to download the file
                                    */}
                                    <li><a className="dropdown-item" role="button" onClick={() => alert("No implementado")}>Share</a></li>
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