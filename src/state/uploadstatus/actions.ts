import { createAction } from "@reduxjs/toolkit";

interface UploadStatus {
  info?: string;
  read?: number;
  size?: number;
  uploading?: boolean;
  decryptionProgress?: number;
}

export const setUploadStatusAction =
  createAction<UploadStatus>("uploadstatus/set");
