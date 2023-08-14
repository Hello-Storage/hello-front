import { toChecksumAddress } from "web3-utils";

export const formatName = (nameOrAddress: string) => {
  if (isValidAddress(nameOrAddress)) {
    return `${nameOrAddress.slice(0, 5)}...${nameOrAddress.slice(-4)}`;
  }

  return nameOrAddress;
};

export const formatUID = (uid: string) => {
  return `${uid.slice(0, 5)}...${uid.slice(-4)}`;
};

const isValidAddress = (address: string) => {
  try {
    toChecksumAddress(address);
    return true;
  } catch (e) {
    return false;
  }
};
