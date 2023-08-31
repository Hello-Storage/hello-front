import { createReducer } from "@reduxjs/toolkit";
import { setUploadStatusAction } from "./actions";

interface UploadStatusProps {
  read: number;
  size: number;
  uploading: boolean;
}

const initialState: UploadStatusProps = {
  read: 0,
  size: 0,
  uploading: false,
};

export default createReducer<UploadStatusProps>(initialState, (builder) => {
  builder.addCase(setUploadStatusAction, (state, { payload }) => ({
    ...state,
    info: payload,
  }));
});
