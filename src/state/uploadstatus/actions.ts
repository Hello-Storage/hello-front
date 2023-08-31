import { createAction } from "@reduxjs/toolkit";

interface UploadStatus {
  read?: number;
  size?: number;
  uploading?: boolean;
}

export const setUploadStatusAction =
  createAction<UploadStatus>("uploadstatus/set");
