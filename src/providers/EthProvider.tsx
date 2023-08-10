import { FC, ReactNode } from "react";
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { ConnectKitProvider } from "connectkit";

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);
const config = createConfig(
  {
    autoConnect: false,
    publicClient,
    webSocketPublicClient,
  }

  // getDefaultConfig({
  //   autoConnect: false,

  //   // Required API Keys
  //   alchemyId: undefined, // or infuraId
  //   walletConnectProjectId: "joinhello",

  //   // Required
  //   appName: "joinhello",

  //   // Optional
  //   appDescription: "hello decentralized storage",
  //   appUrl: "https://joinhello.app", // your app's url
  //   appIcon: "https://joinhello.app/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  // })
);

const EthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiConfig>
  );
};

export default EthProvider;
