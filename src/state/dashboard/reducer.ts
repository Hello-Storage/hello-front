import { createReducer } from "@reduxjs/toolkit";

import { fetchContent, openDropdown, closeDropdown } from "./actions";
import { RootResponse } from "api";

const initialState: RootResponse = {
  root: "/",
  files: [],
  folders: [],
  dropdownIndex: null as string | null,
};

export default createReducer<RootResponse>(initialState, (builder) => {
  builder.addCase(fetchContent, (state, { payload }) => ({
    ...state,
    ...payload,
  }))
  .addCase(openDropdown, (state, { payload }) => ({
    ...state,
    dropdownIndex: payload,
  }))
  .addCase(closeDropdown, (state) => ({
    ...state,
    dropdownIndex: null,
    }));
});