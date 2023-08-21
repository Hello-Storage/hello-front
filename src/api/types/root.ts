import { File, Folder } from ".";

export interface RootResponse {
  root: string;
  path: Folder[];
  files: File[];
  folders: Folder[];
}
