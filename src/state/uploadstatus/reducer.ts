import { createReducer } from "@reduxjs/toolkit";
import { setUploadStatusAction } from "./actions";

interface UploadStatusProps {
  info: string;
  read: number;
  size: number;
  uploading: boolean;
}

const initialState: UploadStatusProps = {
  info: "",
  read: 0,
  size: 0,
  uploading: false,
};

export default createReducer<UploadStatusProps>(initialState, (builder) => {
  builder.addCase(setUploadStatusAction, (state, { payload }) => ({
    ...state,
    ...payload,
  }));
});
