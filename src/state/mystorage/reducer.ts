/* eslint-disable @typescript-eslint/no-unused-vars */
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
  fetchSharedContentAction,
  refreshAction,
  setSelectedShareFolder,
  fetchSharedContentActionFolders,
  addCache,
  resetCache,
  removeSharedFileAction,
  addCancelToken,
  removeCancelToken,
} from "./actions";
import { File as FileType, Folder, RootResponse } from "api";
import { CancelTokenSource } from "axios";

interface MyStorageProps extends RootResponse {
  preview: PreviewImage | undefined;
  showPreview: boolean;
  showShareModal: boolean;
  selectedShareFile?: FileType;
  selectedShowFile?: FileType;
  selectedShareFolder?: Folder;
  selectedSharedFiles?: FileType[];
  sharedFiles: { sharedWithMe: FileType[], sharedByMe: FileType[] };
  sharedFolders: { sharedWithMe: Folder[]; sharedByMe: Folder[] }
  refresh: boolean;
  cache: { [key: string]: Blob };
  cancelSources: { [key: string]: CancelTokenSource };
}

const initialState: MyStorageProps = {
  root: "/",
  path: [],
  files: [],
  sharedFiles: {
    sharedWithMe: [],
    sharedByMe: [],
  },
  sharedFolders: {
    sharedWithMe: [],
    sharedByMe: [],
  },
  preview: undefined,
  folders: [],
  showPreview: false,
  showShareModal: false,
  selectedShareFolder: undefined,
  selectedShareFile: undefined,
  selectedSharedFiles: undefined,
  refresh: false,
  cache: {},
  cancelSources: {},
};


export default createReducer<MyStorageProps>(initialState, (builder) => {
  builder
    .addCase(fetchContentAction, (state, { payload }) => ({
      ...state,
      ...payload,
    }))
    .addCase(addCache, (state, { payload }) => ({
      ...state,
      cache: { ...state.cache, ...payload }
    }))
    .addCase(resetCache, (state, { payload }) => ({
      ...state,
      cache: {}
    }))
    .addCase(setSelectedShareFolder, (state, { payload }) => ({
      ...state,
      selectedShareFolder: payload,
    }))
    .addCase(fetchSharedContentAction, (state, { payload }) => ({
      ...state,
      ...payload,
    }))
    .addCase(fetchSharedContentActionFolders, (state, { payload }) => ({
      ...state,
      ...payload,
    }))
    .addCase(createFolderAction, (state, { payload }) => ({
      ...state,
      folders: [...state.folders, payload],
    }))
    .addCase(refreshAction, (state, { payload }) => ({
      ...state,
      refresh: payload,
    }))
    .addCase(setImageViewAction, (state, { payload }) => ({
      ...state,
      preview: payload.img,
      showPreview: payload.show ?? false,
    }))
    .addCase(removeFileAction, (state, { payload }) => ({
      ...state,
      files: state.files.filter(file => file.uid !== payload),
    }))
    .addCase(removeSharedFileAction, (state, { payload }) => ({
      ...state,
      sharedFiles: {
        sharedWithMe: state.sharedFiles.sharedWithMe.filter(file => file.uid !== payload),
        sharedByMe: state.sharedFiles.sharedByMe.filter(file => file.uid !== payload),
      },
    }))
    .addCase(removeFolder, (state, { payload }) => ({
      ...state,
      folders: state.folders.filter(folder => folder.uid !== payload),
    }))
    .addCase(removeContent, (state) => ({
      ...state,
      files: [],
      folders: [],
      sharedFiles: {
        sharedWithMe: [],
        sharedByMe: [],
      },
    }))
    .addCase(setFileViewAction, (state, { payload }) => ({
      ...state,
      selectedShowFile: payload.file,
    }))
    .addCase(updateDecryptedFilesAction, (state, { payload }) => {
      state.files = state.files.map(file => {
        const decryptedFile = payload.find(pf => pf.id === file.id);
        return decryptedFile || file;
      });
    })
    .addCase(updateDecryptedSharedFilesAction, (state, { payload }) => {
      state.sharedFiles = {
        sharedWithMe: state.sharedFiles.sharedWithMe.map(file => {
          const decryptedFile = payload.sharedWithMe.find(pf => pf.id === file.id);
          return decryptedFile || file;
        }),
        sharedByMe: state.sharedFiles.sharedByMe.map(file => {
          const decryptedFile = payload.sharedByMe.find(pf => pf.id === file.id);
          return decryptedFile || file;
        }),
      };
    })
    .addCase(updateDecryptedFoldersAction, (state, { payload }) => {
      state.folders = state.folders.map(folder => {
        const decryptedFolder = payload.find(pf => pf.id === folder.id);
        return decryptedFolder || folder;
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
    }))
    .addCase(addCancelToken, (state, { payload }) => ({
      ...state,
      cancelSources: {
        ...state.cancelSources,
        ...payload,
      },
    }))
    .addCase(removeCancelToken, (state, { payload }) => {
      const newCancelSources = { ...state.cancelSources };
      delete newCancelSources[payload];
      return {
        ...state,
        cancelSources: newCancelSources,
      };
    })
});
