import { AxiosResponse } from "axios"
import { deleteFile } from "../../requests/clientRequests"
import { FileDB } from "../../types"
import { createPortal } from "react-dom"

export const DeleteModal = (props: { selectedFile: FileDB | null, deleteFileFromList: (file: FileDB | null) => void }) => {
    const selectedFile: FileDB | null = props.selectedFile

    return createPortal(
        (
        <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Delete {selectedFile?.metadata?.name}</h5>
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
        ), document.body as HTMLElement
    )

}