import styles from "../styles/ConnectWallet.module.css";
import { ConnectWalletButtonProps } from "../types";



const ConnectWalletButton = ({
    onPressLogout,
    onPressConnect,
    loading,
    address,
    customToken
}: ConnectWalletButtonProps) => {


    return (
        <div>
            {!loading && (address && customToken) ? (
                <button onClick={
                    onPressLogout
                }
                    className={styles["connect-wallet"]}>
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
                    <img
                        width={30}
                        className="mx-2"
                        src="./assets/MetaMask_Fox.svg.png"
                    />
                </button>
            )}
        </div>
    );
}

export default ConnectWalletButton;