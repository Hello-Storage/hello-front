import { CID } from "multiformats/cid"
import { sha256 } from "multiformats/hashes/sha2"

const RAW_CODEC = 0x55

/* istanbul ignore file */
const importKeyFromBytes = async (keyBytes: ArrayBuffer) =>
  window.crypto.subtle.importKey('raw', keyBytes, 'PBKDF2', false, [
    'deriveKey',
  ])

const deriveKey = async (
  sourceKey: CryptoKey,
  keyUsage: KeyUsage[],
  keyDerivationParams: Pbkdf2Params
) =>
  window.crypto.subtle.deriveKey(
    keyDerivationParams,
    sourceKey,
    { name: 'AES-GCM', length: 256 },
    false,
    keyUsage
  )

export const encryptMetadata = async (file: File, personalSignature: string): Promise<Uint8Array> => {
  const passwordBytes = new TextEncoder().encode(personalSignature)

  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const passwordKey = await importKeyFromBytes(passwordBytes)

  const aesKey = await deriveKey(passwordKey, ['encrypt'], {
    name: 'PBKDF2',
    salt: salt,
    iterations: 250000,
    hash: 'SHA-256',
  })

  const metadataStr = JSON.stringify({
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
  })

  const metadataArrayBuffer = new TextEncoder().encode(metadataStr)


  const cipherBytes = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    metadataArrayBuffer
  )

  const cipherBytesArray = new Uint8Array(cipherBytes)
  const resultBytes = new Uint8Array(
    cipherBytesArray.byteLength + salt.byteLength + iv.byteLength
  )
  resultBytes.set(salt, 0)
  resultBytes.set(iv, salt.byteLength)
  resultBytes.set(cipherBytesArray, salt.byteLength + iv.byteLength)



  return resultBytes
}

export const decryptContent = async (cipherBytes: Uint8Array | string, personalSignature: string): Promise<ArrayBuffer> => {
  if (typeof cipherBytes === 'string') {
    cipherBytes = Uint8Array.from(atob(cipherBytes), (c) => c.charCodeAt(0))
  }

  const passwordBytes = new TextEncoder().encode(personalSignature)

  const salt = cipherBytes.slice(0, 16)
  const iv = cipherBytes.slice(16, 16 + 12)
  const data = cipherBytes.slice(16 + 12)
  const passwordKey = await importKeyFromBytes(passwordBytes)
  const aesKey = await deriveKey(passwordKey, ['decrypt'], {
    name: 'PBKDF2',
    salt: salt,
    iterations: 250000,
    hash: 'SHA-256',
  })

  const decryptedContent = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    aesKey,
    data
  )

  return decryptedContent;
}

export const encryptBuffer = async (buffer: ArrayBuffer, personalSignature: string): Promise<Uint8Array> => {
  const passwordBytes = new TextEncoder().encode(personalSignature)

  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const passwordKey = await importKeyFromBytes(passwordBytes)

  const aesKey = await deriveKey(passwordKey, ['encrypt'], {
    name: 'PBKDF2',
    salt: salt,
    iterations: 250000,
    hash: 'SHA-256',
  })


  const cipherBytes = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    buffer
  )


  const cipherBytesArray = new Uint8Array(cipherBytes)
  const resultBytes = new Uint8Array(
    cipherBytesArray.byteLength + salt.byteLength + iv.byteLength
  )
  resultBytes.set(salt, 0)
  resultBytes.set(iv, salt.byteLength)
  resultBytes.set(cipherBytesArray, salt.byteLength + iv.byteLength)

  return resultBytes
}

export const encryptFileBuffer = async (fileArrayBuffer: ArrayBuffer) => {
  try {
    //convert file array buffer to a unit8 plain text array
    const uint8FileBuffer = new Uint8Array(fileArrayBuffer)

    const hash = await sha256.digest(uint8FileBuffer)
    const cid = CID.create(1, sha256.code, hash)

    const cidStr = cid.toString()


    const passwordBytes = new TextEncoder().encode(cidStr)

    const salt = window.crypto.getRandomValues(new Uint8Array(16))
    const iv = window.crypto.getRandomValues(new Uint8Array(12))




    const passwordKey = await importKeyFromBytes(passwordBytes)

    const aesKey = await deriveKey(passwordKey, ['encrypt'], {
      name: 'PBKDF2',
      salt: salt,
      iterations: 250000,
      hash: 'SHA-256',
    })

    const start = performance.now();

    const cipherBytes = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      aesKey,
      uint8FileBuffer
    )


    const end = performance.now();
    let encryptionTime = end - start;
    let encryptionSuffix = "milliseconds"

    if (encryptionTime >= 1000 && encryptionTime < 60000) {
      encryptionTime /= 1000;
      encryptionSuffix = "seconds"
    } else if (encryptionTime >= 60000) {
      encryptionTime /= 60000;
      encryptionSuffix = "minutes"
    }

    console.log("Encrypting the file took " + encryptionTime + " " + encryptionSuffix)


    const cipherBytesArray = new Uint8Array(cipherBytes)
    const resultBytes = new Uint8Array(
      cipherBytesArray.byteLength + salt.byteLength + iv.byteLength
    )
    resultBytes.set(salt, 0)
    resultBytes.set(iv, salt.byteLength)
    resultBytes.set(cipherBytesArray, salt.byteLength + iv.byteLength)

    const encryptedHash = await sha256.digest(resultBytes)
    const encryptedCid = CID.create(1, RAW_CODEC, encryptedHash)

    const cidOfEncryptedBufferStr = encryptedCid.toString()


    return { cidOfEncryptedBufferStr, cidStr, encryptedFileBuffer: resultBytes, encryptionTime }
  } catch (error) {
    console.error('Error encrypting file')
    console.error(error)
    throw error
  }
}

export const decryptFileBuffer = async (cipher: ArrayBuffer, originalCid: string): Promise<ArrayBuffer | null> => {
  try {
    const cipherBytes = new Uint8Array(cipher)
    const passwordBytes = new TextEncoder().encode(originalCid)

    const salt = cipherBytes.slice(0, 16)
    const iv = cipherBytes.slice(16, 16 + 12)
    const data = cipherBytes.slice(16 + 12)
    const passwordKey = await importKeyFromBytes(passwordBytes)
    const aesKey = await deriveKey(passwordKey, ['decrypt'], {
      name: 'PBKDF2',
      salt: salt,
      iterations: 250000,
      hash: 'SHA-256',
    })

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      aesKey,
      data
    )

    return decryptedContent
  } catch (error) {
    console.error('Error decrypting file')
    console.error(error)
    throw error
  }
}