import { AxiosProgressEvent } from "axios";
import { AppDispatch } from "state";

export interface UploadStatus {
  name: string;
  read: number;
  size: number;
}


export type FilesUpload = {
  files: FileList;
  isFolder: boolean;
  root: string;
  encryptionEnabled: boolean | undefined;
  name: string;
  logout: () => void;
  dispatch: AppDispatch;
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void;
  fetchUserDetail: () => void;
  shareModal?: boolean | undefined;
}
