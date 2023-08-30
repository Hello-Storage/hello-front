import { createReducer } from "@reduxjs/toolkit";
import { UploadStatus } from "api/types/upload";
import { fetchUploadStatusAction } from "./actions";

interface UploadStatusProps {
  info: UploadStatus[];
  show: boolean;
}

const initialState: UploadStatusProps = {
  info: [],
  show: false,
};

export default createReducer<UploadStatusProps>(initialState, (builder) => {
  builder.addCase(fetchUploadStatusAction, (state, { payload }) => ({
    ...state,
    info: payload,
  }));
});
