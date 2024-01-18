import { File as FileType } from "./base";

export interface MultipartFile {
  customFile: FileType;
  file: File;
  cidOriginal: string;
  cidOfEncryptedBufferStr: string
}

export interface FileMap {
    customFile: FileType;
    file: File;
}