import { signMessage } from "@wagmi/core";
import * as Web3 from "web3";

export const digestMessage = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
};

export const signPersonalSignature = async (
  address: string
): Promise<string> => {
  const message = `https://hello.storage/\nPersonal signature\n\nWallet address:\n${address}`;

  const signature = await signMessage({ message });

  return signature;
};

export const getHashFromSignature = async (
  signature: string
): Promise<ArrayBuffer> => {
  const hash = await digestMessage(signature);
  return hash;
};
