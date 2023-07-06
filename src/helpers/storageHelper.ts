import { decryptContent } from "./cipher";

export const decryptMetadata = async (encryptedMetadata: string, ivStr: string, key: CryptoKey) => {
    //decrypt metadata

    const encryptedMetadataBytes = Uint8Array.from(
        atob(encryptedMetadata),
        (c) => c.charCodeAt(0)
    )

    const iv = Uint8Array.from(atob(ivStr), (c) => c.charCodeAt(0))

    //deecrypt the metadata
    const metadataBuffer = await decryptContent(
        iv,
        key,
        encryptedMetadataBytes
    )

    //transform metadata from ArrayBuffer to string
    const decoder = new TextDecoder()
    const metadataString = decoder.decode(metadataBuffer)

    //transform metadata from string to JSON Object
    const metadata = JSON.parse(metadataString)

    return metadata
}

export const formatByteWeight = (weight: number): string => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  const TB = GB * 1024;

  let size: string;
  switch (true) {
    case weight >= TB:
      size = `${(weight / TB).toFixed(2)}TB`;
      break;
    case weight >= GB:
      size = `${(weight / GB).toFixed(2)}GB`;
      break;
    case weight >= MB:
      size = `${(weight / MB).toFixed(2)}MB`;
      break;
    case weight >= KB:
      size = `${(weight / KB).toFixed(2)}KB`;
      break;
    default:
      size = `${weight}B`;
  }

  console.log("File Size:", size);
  return size;
}