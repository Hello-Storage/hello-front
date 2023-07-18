import { AxiosResponse } from "axios";

export interface ConnectWalletButtonProps {
    onPressLogout: () => void;
    onPressConnect: () => void;
    loading: boolean;
    address: string | null;
    customToken: string | null;
}

export interface PasswordModalProps {
    showPasswordModal: boolean;
    closePasswordModal: () => void;
    setLoading: (loading: boolean) => void;
    setToastMessage: (message: string) => void;
    setShowToast: (showToast: boolean) => void;
}


export interface FileDB {
    CreatedAt: string;
    DeletedAt: string | null;
    ID: number;
    UpdatedAt: string;
    cidEncryptedOriginalStr: string;
    cidOriginalStr?: string;
    cidOfEncryptedBuffer: string;
    encryptedMetadata: string;
    userAddress: string;
    metadata: FileMetadata | null;
}

export interface FileUploadResponse {
    file: FileDB;
}

export interface FileUploadResponseWithTime {
    response: AxiosResponse<FileUploadResponse>;
    encryptionTime: number;
}

export interface FileMetadata {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

export interface PieData {
    name: string;
    value: number;
}

export interface PieTypes {
    [key: string]: string[];
}



export interface PublishedFile {
    ID: number;
    CreatedAt: Date;
    UpdatedAt: Date;
    DeletedAt: Date;
    cidOfEncryptedBuffer: string;
    cidOriginalStr: string;
    fileID: number;
    hash: string;
    metadata: FileMetadata;
    userAddress: string;
}