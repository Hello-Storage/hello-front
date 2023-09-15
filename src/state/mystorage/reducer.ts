import { createReducer } from "@reduxjs/toolkit";

import {
  fetchContentAction,
  createFolderAction,
  setImageViewAction,
  PreviewImage,
  removeContent,
} from "./actions";
import { RootResponse } from "api";

interface MyStorageProps extends RootResponse {
  preview: PreviewImage | undefined;
  showPreview: boolean;
}
const initialState: MyStorageProps = {
  root: "/",
  path: [],
  files: [],
  folders: [],
  preview: undefined,
  showPreview: false,
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
    .addCase(removeContent, (state) => ({
      ...state,
      files: [],
      folders: [],
    }));
});
