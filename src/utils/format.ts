import { toChecksumAddress } from "web3-utils";

export const formatName = (nameOrAddress: string) => {
  if (isValidAddress(nameOrAddress)) {
    return `${nameOrAddress.slice(0, 5)}...${nameOrAddress.slice(-4)}`;
  }

  return nameOrAddress;
};

export const formatUID = (uid: string) => {
  return `${uid.slice(0, 2)}...${uid.slice(-4)}`;
};

const isValidAddress = (address: string) => {
  try {
    toChecksumAddress(address);
    return true;
  } catch (e) {
    return false;
  }
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const formatPercent = (child: number, parent: number, decimal = 2) => {
  const num = child / parent;

  const numberFormater = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: decimal,
  });
  return numberFormater.format(Number(num));
};

export const truncate = (str: string, num: number): string => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};
