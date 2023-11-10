import { File, Folder } from ".";

export interface RootResponse {
  root: string;
  path: Folder[];
  files: File[];
  sharedFiles: {sharedWithMe: File[], sharedByMe: File[]}
  folders: Folder[];
}

export interface SharedResponse {
  SharedWithMe: File[];
  SharedByMe: File[];
}