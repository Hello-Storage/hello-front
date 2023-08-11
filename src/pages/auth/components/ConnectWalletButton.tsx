import { useEffect } from "react";
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

  useEffect(() => {
    if (isConnected && address) login(address);
  }, [address, isConnected]);

  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress }: ConnectButtonProps) => {
        return (
          <button
            onClick={isConnected ? undefined : show}
            className="w-full inline-flex items-center justify-center text-white p-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800"
          >
            {isConnected ? truncatedAddress : "Connect with Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
}
