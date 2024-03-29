/* eslint-disable @typescript-eslint/no-unused-vars */
import { File as FileType } from "api";

export function buff2base64(buffer: Uint8Array): string {
  const str = String.fromCharCode(...buffer);
  let base64 = btoa(str);

  // Convert standard Base64 to Base64 URL encoding
  base64 = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return base64;
}

export function base642buff(base64Url: string): Uint8Array {
  try {
    // Convert Base64 URL encoding to standard Base64 encoding
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    const str = atob(base64);
    const buffer = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      buffer[i] = str.charCodeAt(i);
    }

    return buffer;
  } catch (error) {
    console.error("Error converting base64Url to buffer");
    console.error(error);
    throw error;
  }
}

const str2arrbuff = (str: string) => {
  return new TextEncoder().encode(str);
};

const arrbuff2str = (arr: ArrayBuffer) => {
  return new TextDecoder().decode(arr);
};

const readFile = (file: File) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result as ArrayBuffer);
    };
    fr.readAsArrayBuffer(file);
  });
};

const createAES = async (
  salt: Uint8Array,
  secret: string,
  type: "encrypt" | "decrypt"
) => {
  const passphrasekey = await window.crypto.subtle.importKey(
    "raw",
    str2arrbuff(secret),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const pbkdf2bytes = await window.crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 10000,
      hash: "SHA-256",
    },
    passphrasekey,
    384
  );

  const keybytes = new Uint8Array(pbkdf2bytes).slice(0, 32);
  const iv = new Uint8Array(pbkdf2bytes).slice(32);

  const key = await crypto.subtle.importKey(
    "raw",
    keybytes,
    { name: "AES-CBC", length: 256 },
    false,
    [type]
  );

  return { key, iv };
};

export const encrypt = async (
  file: File,
  secret: string,
  salt?: Uint8Array
) => {
  let buffer = await readFile(file);
  buffer = new Uint8Array(buffer);

  // Generate a 16 byte long initialization vector
  const pbkdf2salt = salt ?? crypto.getRandomValues(new Uint8Array(8));
  const { key, iv } = await createAES(pbkdf2salt, secret, "encrypt");

  //   encrypt file metadata
  const splits =
    file.webkitRelativePath === ""
      ? file.name.split("/")
      : file.webkitRelativePath.split("/");
  const promises = splits.map(async (value) => {
    const enc = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: iv },
      key,
      str2arrbuff(value)
    );
    const name = new Uint8Array(enc.byteLength + 8);
    name.set(pbkdf2salt);
    name.set(new Uint8Array(enc), 8);

    return buff2base64(name);
  });

  const name = (await Promise.all(promises)).join("/");

  //   encrypt file content
  const cipherBytes = await window.crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    key,
    buffer
  );
  const cipher = new Uint8Array(cipherBytes);
  const resultbytes = new Uint8Array(cipher.length + 8);
  resultbytes.set(pbkdf2salt);
  resultbytes.set(cipher, 8);

  const cipherBlob = new Blob([resultbytes]);
  const encryptedFile = new File([cipherBlob], name);

  return encryptedFile;
};

export const decryptMeta = async (file: FileType, secret: string) => {
  const pbkdf2salt = base642buff(file.name).slice(0, 8);

  const { key, iv } = await createAES(pbkdf2salt, secret, "decrypt");

  // decrypt file metadata
  const file_name = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: iv },
    key,
    base642buff(file.name).slice(8)
  );

  const result = file;
  result.name = arrbuff2str(file_name);

  return result;
};

export const decrypt = async (file: File, secret: string) => {
  let buffer = await readFile(file);
  buffer = new Uint8Array(buffer);

  const pbkdf2salt = buffer.slice(0, 8);

  const { key, iv } = await createAES(
    new Uint8Array(pbkdf2salt),
    secret,
    "decrypt"
  );

  // decrypt file content
  buffer = buffer.slice(8);
  const planBytes = await window.crypto.subtle.decrypt(
    { name: "AES-CBC", iv: iv },
    key,
    buffer
  );

  const blob = new Blob([planBytes]);

  const result = new File([blob], "decrypt");
  return result;
};

export const encryptStr = async (str: string, secret: string) => {
  const pbkdf2salt = crypto.getRandomValues(new Uint8Array(8));
  const { key, iv } = await createAES(pbkdf2salt, secret, "encrypt");

  //   encrypt file metadata
  const enc = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    key,
    str2arrbuff(str)
  );

  const result = new Uint8Array(enc.byteLength + 8);
  result.set(pbkdf2salt);
  result.set(new Uint8Array(enc), 8);

  return buff2base64(result);
};

export const decryptStr = async (str: string, secret: string) => {
  const pbkdf2salt = base642buff(str).slice(0, 8);
  const { key, iv } = await createAES(pbkdf2salt, secret, "decrypt");

  //   encrypt file metadata
  const dec = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: iv },
    key,
    base642buff(str).slice(8)
  );

  return arrbuff2str(dec);
};
