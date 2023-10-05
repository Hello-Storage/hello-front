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

export const createFolder = createAction<Folder>("dashboard/create-folder");

export const createFile = createAction<FileType>("dashboard/create-file");

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
