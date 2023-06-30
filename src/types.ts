export interface ConnectWalletButtonProps {
    onPressLogout: () => void;
    onPressConnect: () => void;
    loading: boolean;
    address: string|null;
    customToken: string|null;
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
    DeletedAt: string|null;
    ID: number;
    UpdatedAt: string;
    cidEncryptedOriginalStr: string;
    cidOfEncryptedBuffer: string;
    encryptedMetadata: string;
    iv: string;
    userAddress: string;
    metadata: FileMetadata | null;
}

export interface FileUploadResponse {
  file: FileDB;
}

export interface FileMetadata {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}