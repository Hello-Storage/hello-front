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
    setAddress: (address: string) => void;
    setLoading: (loading: boolean) => void;
    setToastMessage: (message: string) => void;
    setShowToast: (showToast: boolean) => void;
}

export interface FileDB {
    CreatedAt: string;
    DeletedAt: string|null;
    ID: number;
    UpdatedAt: string;
    cid: string;
    filename: string;
    userAddress: string;
}