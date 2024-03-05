import { AxiosProgressEvent } from "axios";

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
  dispatch: (action: any) => void;
  onUploadProgress: (progressEvent: AxiosProgressEvent) => void;
  fetchUserDetail: () => void;
  shareModal?: boolean | undefined;
}
