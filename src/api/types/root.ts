import { File, Folder } from ".";

export interface RootResponse {
  root: string;
  files: File[];
  folders: Folder[];
  dropdownIndex: string | null;
}
