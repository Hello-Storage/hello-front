import { createAction } from "@reduxjs/toolkit";
import { UploadStatus } from "api/types/upload";

export const fetchUploadStatusAction =
  createAction<UploadStatus[]>("uploadstatus/fetch");
