export interface ShareDetails {
    id: number,
    type: string;
    title: string;
    description?: string;
    state: string; //selected, enabled or disabled
}

export interface PublicFile {
    id: number;
    cid: string;
    cid_original_decrypted: string;
    file_uid: string;
    mime_type: string;
    name: string;
    share_hash: string;
    size: number;
    hash: string;
    metadata: File;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface PublicFileUserShared {
    id: number;
    cid: string;
    cid_original_decrypted: string;
    file_uid: string;
    mime_type: string;
    name: string;
    share_hash: string;
    size: number;
}

export interface ShareState {
    id: number;
    file_uid: string;
    public_file: PublicFile;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

export interface User {
	email: string;
	color: string;
}
