import { signMessage } from "@wagmi/core";
import { AccountType } from "api";
import * as Web3 from "web3";

export const digestMessage = async (message: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hash;
};

export const signPersonalSignature = async (
  address: string,
  account_type: AccountType,
  privateKey?: string
): Promise<string> => {
  const message = `https://hello.storage/\nPersonal signature\n\nWallet address:\n${address}`;

  let signature = "";
  if (account_type === AccountType.Provider) {
    signature = await signMessage({ message });
  } else if (privateKey) {
    const web3 = new Web3.default();
    signature = web3.eth.accounts.sign(message, privateKey).signature;
  }

  //return personal signature
  return signature;
};

export const getHashFromSignature = async (
  signature: string
): Promise<ArrayBuffer> => {
  const hash = await digestMessage(signature);
  return hash;
};
