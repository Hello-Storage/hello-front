export interface ConnectWalletButtonProps {
    onPressLogout: () => void;
    onPressConnect: () => void;
    loading: boolean;
    address: string;
}