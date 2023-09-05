export enum EncryptionStatus {
  Public = "public",
  Encrypted = "encrypted",
}

interface Base {
  id: number;
  created_at: string;
  deleted_at: string | null;
  updated_at: string;
  status: EncryptionStatus;
}

export interface File extends Base {
  uid: string;
  cid: string;
  cid_original_encrypted: string;
  name: string;
  root: string;
  mime_type: string;
  size: number;
  media_type: string;
  path: string;
  //base64 data
  data: string;
}

export interface Folder extends Base {
  uid: string;
  title: string;
  root: string;
  path: string;
}