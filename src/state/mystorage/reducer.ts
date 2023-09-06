import { createReducer } from "@reduxjs/toolkit";

import {
  fetchContent,
  openDropdown,
  closeDropdown,
  createFolder,
  removeContent,
} from "./actions";
import { RootResponse } from "api";

const initialState: RootResponse = {
  root: "/",
  path: [],
  files: [],
  folders: [],
};

export default createReducer<RootResponse>(initialState, (builder) => {
  builder
    .addCase(fetchContent, (state, { payload }) => ({
      ...state,
      ...payload,
    }))
    .addCase(createFolder, (state, { payload }) => ({
      ...state,
      folders: [...state.folders, payload],
    }))
    .addCase(removeContent, (state) => (
      {
        ...state,
        files: [],
        folders: [],
      }
      ));
});
