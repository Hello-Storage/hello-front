import { ShareState } from "./share";

export enum EncryptionStatus {
  Public = "public",
  Encrypted = "encrypted",
}

interface Base {
  id: number;
  created_at: string;
  deleted_at: string | null;
  updated_at: string;
  encryption_status: EncryptionStatus;
  decrypted?: boolean;
}

interface UnencryptedBase {
  name_unencrypted?: string;
  mime_type_unencrypted?: string;
  cid_original_unencrypted?: string;
}

export interface File extends Base, UnencryptedBase {
  uid: string;
  cid: string;
  cid_original_encrypted: string;
  cid_original_encrypted_base64_url?: string;
  name: string;
  root: string;
  mime_type: string;
  mime?: string;
  size: number;
  media_type: string;
  is_in_pool?: boolean;
  path: string;
  //base64 data
  data?: string;
  file_share_state?: ShareState;
  isOwner?: boolean;
  ipfs_hash?: string;
}

export interface Folder extends Base {
  uid: string;
  title: string;
  root: string;
  path: string;
  is_in_pool?: boolean;
}