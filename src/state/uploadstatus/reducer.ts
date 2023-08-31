import { createReducer } from "@reduxjs/toolkit";
import { UploadStatus } from "api/types/upload";
import { fetchUploadStatusAction, setUploadingStatusAction } from "./actions";

interface UploadStatusProps {
  info: UploadStatus[];
  uploading: boolean;
}

const initialState: UploadStatusProps = {
  info: [],
  uploading: false,
};

export default createReducer<UploadStatusProps>(initialState, (builder) => {
  builder
    .addCase(fetchUploadStatusAction, (state, { payload }) => ({
      ...state,
      info: payload,
    }))
    .addCase(setUploadingStatusAction, (state, { payload }) => ({
      ...state,
      uploading: payload,
    }));
});
