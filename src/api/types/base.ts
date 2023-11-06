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
  cid_parts_original_unencrypted?: string[];
}

export interface File extends Base, UnencryptedBase {
  uid: string;
  cid?: string;
  cid_parts?: string[];
  cid_parts_original_encrypted?: string[];
  cid_original_encrypted?: string;
  cid_parts_original_encrypted_base64_url?: string[];
  cid_original_encrypted_base64_url?: string;
  name: string;
  root: string;
  mime_type: string;
  size: number;
  media_type: string;
  path: string;
  //base64 data
  data?: string;
  file_share_state?: ShareState;
  last_modified?: number;
  big_file: boolean;
}

export interface Folder extends Base {
  uid: string;
  title: string;
  root: string;
  path: string;
}