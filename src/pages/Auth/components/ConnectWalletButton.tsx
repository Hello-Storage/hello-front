import { useEffect, useState } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useAuth } from "hooks";

interface ConnectButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  show?: () => void;
  hide?: () => void;
  address?: string;
  truncatedAddress?: string;
  ensName?: string;
}

export default function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { login } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isConnected && address) login(address);
  }, [address, isConnected]);

  const onClick = (show: () => void) => {
    setLoading(true);
    show();
  };
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress }: ConnectButtonProps) => {
        return (
          <button
            onClick={isConnected ? undefined : () => onClick(show!)}
            className="w-full inline-flex items-center justify-center text-white p-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800"
            disabled={loading ? true : false}
          >
            {/* {isConnected ? truncatedAddress : "Connect with Wallet"} */}
            {loading ? "Connecting..." : "Connect with Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
