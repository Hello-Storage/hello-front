import { toChecksumAddress } from "web3-utils";

export const formatName = (nameOrAddress: string, trunc?: number) => {
  if (isValidAddress(nameOrAddress)) {
    return `${nameOrAddress.slice(0, 5)}...${nameOrAddress.slice(-4)}`;
  }
  if (trunc) {
    return truncate(nameOrAddress, trunc);
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

export const formatBytes = (bytes: number, decimals = 2, symbol = true) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${symbol ? sizes[i] : ""}`;
};

export const formatPercent = (child: number, parent: number, decimal = 2) => {

  const numberFormater = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: decimal,
  });

  if (child === 0 && parent === 0) {
    return numberFormater.format(0);
  }
  const num = child / parent;
  return numberFormater.format(Number(num));
};

export const truncate = (str: string, num: number): string => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num) + "...";
};

/**
* Converts a list of bytes to the unit specified. If the unit is not found in the list the list is returned unaltered.
* 
* @param {number} bytesList - The list of bytes to convert. Must be non - empty.
* @param {string} unit
* 
* @return { number [] } The list of bytes converted to the unit
*/
export function convertListToUnit(bytesList: number[], unit: string): number[] {
  const units: string[] = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  const unitIndex: number = units.indexOf(unit.trim());
  
  // Returns the bytes list of bytes.
  if (unitIndex === -1) {
    return bytesList
  }

  const conversionFactor: number = Math.pow(1024, unitIndex);


  return bytesList.map((bytes) => {
      return bytes / conversionFactor;
  });
}

