import styles from "../styles/ConnectWallet.module.css";
import { ConnectWalletButtonProps } from "../types";

const ConnectWalletButton = ({
    onPressLogout,
    onPressConnect,
    loading,
    address,
}: ConnectWalletButtonProps) => {
    return (
        <div>
            {address && !loading ? (
                <button onClick={onPressLogout} className={styles["connect-wallet"]}>
                    Disconnect
                </button>
            ) : loading ? (
                <button
                    className={`${styles["connect-wallet"]} ${styles["connect-button-loading"]}`}
                    disabled
                >
                    <div>Loading...</div>
                </button>
            ) : (
                <button onClick={onPressConnect} className={styles["connect-wallet"]}>
                    Connect
                </button>
            )}
        </div>
    );
}

export default ConnectWalletButton;