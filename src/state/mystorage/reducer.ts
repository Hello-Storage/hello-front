import { createReducer } from "@reduxjs/toolkit";

import {
  fetchContentAction,
  createFolderAction,
  setImageViewAction,
  setShowShareModal,
  setSelectedShareFile,
  PreviewImage,
  removeContent,
  updateDecryptedFilesAction,
  updateDecryptedFoldersAction,
  removeFileAction,
  createFileAction,
  removeFolder,
  updateDecryptedSharedFilesAction,
  setFileViewAction,
  setSelectedSharedFiles,
} from "./actions";
import { File as FileType, RootResponse } from "api";

interface MyStorageProps extends RootResponse {
  preview: PreviewImage | undefined;
  showPreview: boolean;
  showShareModal: boolean;
  selectedShareFile?: FileType;
  selectedShowFile?: FileType;
  selectedSharedFiles?: FileType[];
}
const initialState: MyStorageProps = {
  root: "/",
  path: [],
  files: [],
  sharedFiles: {
    sharedWithMe: [],
    sharedByMe: [],
  },
  preview: undefined,
  folders: [],
  showPreview: false,
  showShareModal: false,
  selectedShareFile: undefined,
  selectedSharedFiles: undefined,
};

export default createReducer<MyStorageProps>(initialState, (builder) => {
  builder
    .addCase(fetchContentAction, (state, { payload }) => ({
      ...state,
      ...payload,
    }))
    .addCase(createFolderAction, (state, { payload }) => ({
      ...state,
      folders: [...state.folders, payload],
    }))
    .addCase(setImageViewAction, (state, { payload }) => ({
      ...state,
      preview: payload.img,
      showPreview: payload.show == undefined ? false : payload.show,
    }))
    .addCase(removeFileAction, (state, { payload }) => ({
      ...state,
      files: state.files.filter(file => file.uid !== payload),
    }))
    .addCase(removeFolder, (state, { payload }) => ({
      ...state,
      folders: state.folders.filter(folder => folder.uid !== payload),
    }))
    .addCase(removeContent, (state) => ({
      ...state,
      files: [],
      folders: [],
    }))
    .addCase(setFileViewAction, (state, { payload }) => ({
      ...state,
      selectedShowFile: payload.file,
    }))
    .addCase(updateDecryptedFilesAction, (state, { payload }) => {
      state.files = state.files.map(file => {
        const decryptedFile = payload.find(pf => pf.id === file.id);
        return decryptedFile ? decryptedFile : file;
      });
    })
    .addCase(updateDecryptedSharedFilesAction, (state, { payload }) => {
      state.sharedFiles = {
        sharedWithMe: state.sharedFiles.sharedWithMe.map(file => {
          const decryptedFile = payload.sharedWithMe.find(pf => pf.id === file.id);
          return decryptedFile ? decryptedFile : file;
        }),
        sharedByMe: state.sharedFiles.sharedByMe.map(file => {
          const decryptedFile = payload.sharedByMe.find(pf => pf.id === file.id);
          return decryptedFile ? decryptedFile : file;
        }),
      };
    })
    .addCase(updateDecryptedFoldersAction, (state, { payload }) => {
      state.folders = state.folders.map(folder => {
        const decryptedFolder = payload.find(pf => pf.id === folder.id);
        return decryptedFolder ? decryptedFolder : folder;
      });
    })
    .addCase(createFileAction, (state, { payload }) => ({
      ...state,
      files: [payload, ...state.files],
    }))
    .addCase(setShowShareModal, (state, { payload }) => ({
      ...state,
      showShareModal: payload,
    }))
    .addCase(setSelectedShareFile, (state, { payload }) => ({
      ...state,
      selectedShareFile: payload,
    }))
    .addCase(setSelectedSharedFiles, (state, { payload }) => ({
      ...state,
      selectedSharedFiles: payload,
    }));
});
