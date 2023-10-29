import { createAction } from "@reduxjs/toolkit";
import { Folder, File as FileType, RootResponse } from "api";

export interface PreviewImage {
  src?: string;
  alt: string;
  type?: "htmlVideo";
  videoSrc?: string;
}

export const fetchContentAction = createAction<RootResponse>(
  "mystorage/fetch-content"
);
export const createFolderAction = createAction<Folder>(
  "mystorage/create-folder"
);

export const removeContent = createAction<string>("dashboard/remove-content");

export const removeFileAction = createAction<string>("dashboard/remove-file");

export const removeFolder = createAction<string>("dashboard/remove-folder");

export const createFileAction = createAction<FileType>("dashboard/create-file");

export const removeFile = createAction<string>("dashboard/remove-file");

export const updateDecryptedFilesAction = createAction<FileType[]>(
  "myStorage/updateDecryptedFiles"
);

export const updateDecryptedFoldersAction = createAction<Folder[]>(
  "myStorage/updateDecryptedFolders"
);

export const setImageViewAction = createAction<{
  img?: PreviewImage;
  show?: boolean;
}>("mystorage/image-view");

export const setShowShareModal = createAction<boolean>(
  "mystorage/set-show-share-modal"
);

export const setSelectedShareFile = createAction<FileType | undefined>(
  "mystorage/set-selected-share-file"
);