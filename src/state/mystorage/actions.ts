import { createAction } from "@reduxjs/toolkit";
import { Folder, File as FileType, RootResponse, SharedRFiles, SharedRFolders } from "api";
import { CancelTokenSource } from "axios";

export interface PreviewImage {
  src?: string;
  alt: string;
  type?: "video" | "image" | "other";
  tmbSrc?: string;
}

export const fetchContentAction = createAction<RootResponse>(
  "mystorage/fetch-content"
);
export const fetchSharedContentAction = createAction<SharedRFiles>(
  "mystorage/fetch-shared-content"
);
export const fetchSharedContentActionFolders = createAction<SharedRFolders>(
  "mystorage/fetch-shared-content-folders"
);
export const refreshAction = createAction<boolean>(
  "mystorage/refresh-content"
);
export const createFolderAction = createAction<Folder>(
  "mystorage/create-folder"
);

export const removeContent = createAction<undefined>("dashboard/remove-content");

export const removeFileAction = createAction<string>("dashboard/remove-file");

export const removeSharedFileAction = createAction<string>("dashboard/remove-shared-file");

export const removeFolder = createAction<string>("dashboard/remove-folder");

export const createFileAction = createAction<FileType>("dashboard/create-file");

export const removeFile = createAction<string>("dashboard/remove-file");

export const updateDecryptedFilesAction = createAction<FileType[]>(
  "mystorage/updateDecryptedFiles"
);
export const updateDecryptedSharedFilesAction = createAction<{
  sharedByMe: FileType[];
  sharedWithMe: FileType[];
}>("mystorage/updateDecryptedSharedFiles");

export const updateDecryptedFoldersAction = createAction<Folder[]>(
  "mystorage/updateDecryptedFolders"
);

export const setImageViewAction = createAction<{
  img?: PreviewImage
  show?: boolean;
}>("mystorage/image-view");

export const setFileViewAction = createAction<{
  file?: FileType;
}>("mystorage/file-view");


export const setShowShareModal = createAction<boolean>(
  "mystorage/set-show-share-modal"
);

export const setSelectedShareFile = createAction<FileType | undefined>(
  "mystorage/set-selected-share-file"
);

export const addCache = createAction<{ [key: string]: Blob }>(
  "mystorage/add-cache"
);

export const resetCache = createAction<undefined>(
  "mystorage/clear-cache"
);

export const setSelectedShareFolder = createAction<Folder | undefined>(
  "mystorage/set-selected-share-folder"
);

export const setSelectedSharedFiles = createAction<FileType[] | undefined>(
  "mystorage/set-selected-shared-files"
);

export const addCancelToken = createAction<{ [key: string]: CancelTokenSource }>(
  "mystorage/add-cancel-token"
);

export const removeCancelToken = createAction<string>(
  "mystorage/remove-cancel-token"
);
