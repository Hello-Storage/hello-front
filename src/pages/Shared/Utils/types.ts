import { File, Folder } from "api";

export class InternalFolderClass {
    folder: FolderContentClass
    constructor(folder: Folder) {
        this.folder = new FolderContentClass(folder, undefined)
    }
}

export class FolderContentClass {
    uid?: string;
    title?: string;
    files: File[];
    folders: InternalFolderClass[];
    folder?: Folder;

    constructor(folder?: Folder, content?: { files: File[]; folders: InternalFolderClass[]; }) {
        this.uid = folder?.uid;
        this.title = folder?.title;
        this.files = content ? content.files : [];
        this.folders = content ? content.folders : [];
        this.folder = folder;
    }

    searchFolderAndSetContent(folder: Folder, content: { files: File[]; folders: InternalFolderClass[]; }) {
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
}

export interface ShareFolderResponse {
    uid: string,
    title: string,
    files: File[],
    folders: Folder[],
}