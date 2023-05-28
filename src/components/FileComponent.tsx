import { FileDB } from "../types"
import { deleteFile, downloadFile } from '../requests/clientRequests.ts'
import { useState } from 'react'
import { AxiosResponse } from "axios"



export const DeleteModal = (props: {selectedFile: FileDB | null, deleteFileFromList: (file: FileDB | null) => void}) => {
    const selectedFile: FileDB|null = props.selectedFile

    return (
        <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Delete {selectedFile?.filename}</h5>
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
                            }} )}>Yes</button> 
                    </div>
                </div>
            </div>
        </div>
    )

}




const FileComponent = (props: {displayedFilesList: FileDB[], deleteFileFromList: (file: FileDB | null) => void}) => {
    const [selectedFile, setSelectedFile] = useState<FileDB | null>(null)

    const displayedFilesList: FileDB[] = props.displayedFilesList
    const deleteFileFromList = props.deleteFileFromList
    return (
        <ul className="list-group">
        <DeleteModal selectedFile={selectedFile} deleteFileFromList={deleteFileFromList}/>
        {displayedFilesList.map((file: FileDB) => {
        return (<li className="list-group-item" key={file.ID}>
            <div className="d-flex justify-content-between align-items-center">
                <p className="mb-0">{file.filename}</p>
                {/*Display file.CreatedAt date with bootstrap */}
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                    </button>
                    <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby="dropdownMenuButton2">
                        <li><a className="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={() => setSelectedFile(file)} href="#">Delete</a></li>
                        <li><a className="dropdown-item" onClick={() => downloadFile(file)}>Download</a></li>
                        <li><hr className="dropdown-divider" /></li>
                        <li><a className="dropdown-item" href="#">Share</a></li>
                    </ul>
                </div>

            </div>
        </li>)})}
        </ul>

    )
}

export default FileComponent