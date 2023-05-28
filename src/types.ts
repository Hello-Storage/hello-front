export interface ConnectWalletButtonProps {
    onPressLogout: () => void;
    onPressConnect: () => void;
    loading: boolean;
    address: string|null;
    customToken: string|null;
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