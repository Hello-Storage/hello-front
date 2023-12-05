interface ShareDetails {
    id: number,
    type: string;
    title: string;
    description?: string;
    state: string; //selected, enabled or disabled
}

interface PublicFile {
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

interface ShareState {
    id: number;
    //File: FileDB;
    public_file: PublicFile;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}

interface User {
	email: string;
	color: string;
}
