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

export interface SharedResponse {
	SharedWithMe: File[];
	SharedByMe: File[];
}
