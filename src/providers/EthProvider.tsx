import { FC, ReactNode } from "react";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [publicProvider()]
);

const config = createConfig({
  autoConnect: false,
  publicClient,
  webSocketPublicClient,
});

// const config = createConfig(
//   getDefaultConfig({
//     autoConnect: false,

//     // Required API Keys
//     // alchemyId: "", // or infuraId
//     infuraId: "c98e454d12794f69bf21afbcc74c3da7",
//     walletConnectProjectId: "1dbf8283aaabbc089924a34f1e9ffad2",

//     // Required
//     appName: "joinhello",

//     // Optional
//     appDescription: "hello decentralized storage",
//     appUrl: "https://joinhello.app", // your app's url
//     appIcon: "https://joinhello.app/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
//   })
// );

const EthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>{children}</ConnectKitProvider>
    </WagmiConfig>
  );
};

export default EthProvider;
