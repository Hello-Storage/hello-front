import { File as FileType, Folder, ShareState } from "api";

export class InternalFolderClass {
    folder: FolderContentClass
    constructor(folder: Folder) {
        this.folder = new FolderContentClass(folder, undefined)
    }
}

export class FolderContentClass {
    uid?: string;
    title?: string;
    files: FileType[];
    folders: InternalFolderClass[];
    folder?: Folder;

    constructor(folder?: Folder, content?: { files: FileType[]; folders: InternalFolderClass[]; }) {
        this.uid = folder?.uid;
        this.title = folder?.title;
        this.files = content ? content.files : [];
        this.folders = content ? content.folders : [];
        this.folder = folder;
    }

    /**
     * Search for a folder in the content and set the content
     * @param folder  The folder to search for
     * @param content  The content to set
     * @returns  The content
     */
    searchFolderAndSetContent(folder: Folder, content: { files: FileType[]; folders: InternalFolderClass[]; }) {
        if (this.uid === folder?.uid) {
            this.files = content?.files;
            this.folders = content?.folders;
            return this
        }
        if (this.folders) {
            for (const folderContentClass of this.folders) {
                folderContentClass.folder?.searchFolderAndSetContent(folder, content);
            }
        }
        return this
    }

    /**
     * Get the total size of the folder
     * @returns  The total size of the folder
     */
    getFolderTotalSize() {
        let totalSize = 0
        if (this.folders) {
            for (const folder of this.folders) {
                totalSize += folder.folder.getFolderTotalSize()
            }
        }
        if (this.files) {
            for (const file of this.files) {
                totalSize += file.size
            }
        }
        return totalSize
    }

    /**
     * get a file path by its uid
     * @param uid  The uid of the file
     * @returns  The file path
     */
    getFilePathByUid(uid: string): string | undefined {
        if (this.files) {
            const file = this.files.find(file => file.uid === uid)
            if (file) {
                return this.title + "/"
            }
        }
        if (this.folders) {
            for (const folder of this.folders) {
                const filePath = folder.folder.getFilePathByUid(uid)
                if (filePath) {
                    return this.title + "/" + filePath
                }
            }
        }
        return undefined
    }

    /**
     * get sharestate from file by uid
     * @param uid  The uid of the file
     * @returns  The sharestate
     */
    getShareStateByUid(uid: string): ShareState | undefined {
        if (this.files) {
            const file = this.files.find(file => file.uid === uid)
            if (file && file.file_share_state?.id != 0) {
                return file.file_share_state
            }
        }
        if (this.folders) {
            for (const folder of this.folders) {
                const shareState = folder.folder.getShareStateByUid(uid)
                if (shareState) {
                    return shareState
                }
            }
        }
        return undefined
    }
}

export interface ShareFolderResponse {
    uid: string,
    title: string,
    files: FileType[],
    folders: Folder[],
}