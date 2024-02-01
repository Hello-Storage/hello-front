import { File, Folder } from ".";

export interface RootResponse {
	root: string;
	path: Folder[];
	files: File[];
	folders: Folder[];
}

export interface SharedRFiles {
	sharedFiles: { sharedWithMe: File[]; sharedByMe: File[] };
}

export interface SharedRFolders {
	sharedFolders: { sharedWithMe: Folder[]; sharedByMe: Folder[] };
}
export interface SharedResponse {
	SharedWithMe: {
		Files: File[],
		Folders: Folder[],
	};
	SharedByMe: {
		Files: File[],
		Folders: Folder[],
	};
}
