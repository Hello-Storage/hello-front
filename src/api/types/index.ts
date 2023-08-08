interface Base {
  ID: number;
  CreatedAt: string;
  DeletedAt: string | null;
  UpdatedAt: string;
}

export interface File extends Base {
  uid: string;
  name: string;
  root: string;
  mimeType: string;
  size: number;
  mediaType: string;
}

export interface Folder extends Base {
  uid: string;
  title: string;
  root: string;
  path: string;
}

export interface RootResponse {
    root: string;
    files: File[];
    folders: Folder[];
  }
  