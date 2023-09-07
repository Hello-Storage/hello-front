import { createAction } from "@reduxjs/toolkit";
import { Folder, RootResponse } from "api";

export interface PreviewImage {
  src: string;
  alt: string;
}

export const fetchContentAction = createAction<RootResponse>(
  "mystorage/fetch-content"
);
export const createFolderAction = createAction<Folder>(
  "mystorage/create-folder"
);

export const setImageViewAction = createAction<{
  img?: PreviewImage;
  show?: boolean;
}>("mystorage/image-view");
