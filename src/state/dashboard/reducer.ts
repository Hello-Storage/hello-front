import { createReducer } from "@reduxjs/toolkit";

import { fetchContent } from "./actions";
import { RootResponse } from "api";

const initialState: RootResponse = {
  root: "/",
  files: [],
  folders: [],
};

export default createReducer<RootResponse>(initialState, (builder) => {
  builder.addCase(fetchContent, (state, { payload }) => ({
    ...state,
    ...payload,
  }));
});
