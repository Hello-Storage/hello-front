import { signMessage } from "@wagmi/core";

export const getSignature = async (address: string): Promise<string> => {
  const message = `https://hello.storage/\nPersonal signature\n\nWallet address:\n${address}`;
  const signature = await signMessage({ message });

  return signature;
};
