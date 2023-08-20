interface Base {
  id: number;
  created_at: string;
  deleted_at: string | null;
  updated_at: string;
}

export interface File extends Base {
  uid: string;
  name: string;
  root: string;
  mime_type: string;
  size: number;
  media_type: string;
}

export interface Folder extends Base {
  uid: string;
  title: string;
  root: string;
  path: string;
}

export * from "./root";
export * from "./auth";
