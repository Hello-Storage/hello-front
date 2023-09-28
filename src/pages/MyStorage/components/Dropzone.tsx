import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { useFetchData, useAuth } from "hooks";
import {
  bufferToBase64Url,
  bufferToHex,
  encryptBuffer,
  encryptFileBuffer,
  encryptMetadata,
  getCid,
} from "utils/encryption/filesCipher";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import getPersonalSignature from "api/getPersonalSignature";
import getAccountType from "api/getAccountType";

import { useAppDispatch, useAppSelector } from "state";
import { AxiosProgressEvent } from "axios";
import { Api } from "api";

const getColor = (
  isFocused: boolean,
  isDragAccept: boolean,
  isDragReject: boolean
) => {
  if (isDragAccept) {
    return "border-[#00e676]";
  }
  if (isDragReject) {
    return "border-[#ff1744]";
  }
  if (isFocused) {
    return "border-[#2196f3]";
  }
  return "border-[#eeeeee]";
};

const Dropzone = () => {
  const { encryptionEnabled, autoEncryptionEnabled } = useAppSelector(
    (state) => state.userdetail
  );

  const thisEncryptionEnabledRef = useRef(encryptionEnabled);
  const thisAutoEncryptionEnabledRef = useRef(autoEncryptionEnabled);
  

  useEffect(() => {
    thisEncryptionEnabledRef.current = encryptionEnabled;
    thisAutoEncryptionEnabledRef.current = autoEncryptionEnabled;
  }, [autoEncryptionEnabled, encryptionEnabled])


  const { name } = useAppSelector((state) => state.user);
  const { fetchRootContent, fetchUserDetail } = useFetchData();

  const { logout } = useAuth();
  const dispatch = useAppDispatch();
  const accountType = getAccountType();

  const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    dispatch(
      setUploadStatusAction({
        read: progressEvent.loaded,
        size: progressEvent.total,
      })
    );
  };

  const getRoot = () =>
    location.pathname.includes("/folder")
      ? location.pathname.split("/")[2]
      : "/";

  const handleEncryption = async (
    file: File,
    personalSignature: string | undefined,
    isFolder: boolean,
    encryptedPathsMapping: { [path: string]: string }
  ): Promise<{
    encryptedFile: File;
    cidOfEncryptedBufferStr: string;
    cidOriginalEncryptedBase64Url: string;
    encryptedWebkitRelativePath: string;
    encryptionTime: number;
  } | null> => {
    const fileArrayBuffer = await file.arrayBuffer();

    const encryptedMetadataResult = await encryptMetadata(
      file,
      personalSignature
    );
    if (!encryptedMetadataResult) {
      toast.error("Failed to encrypt metadata");
      return null;
    }
    const { encryptedFilename, encryptedFiletype, fileSize, fileLastModified } =
      encryptedMetadataResult;
    const {
      cidOriginalStr,
      cidOfEncryptedBufferStr,
      encryptedFileBuffer,
      encryptionTime,
    } = await encryptFileBuffer(fileArrayBuffer);

    const encryptedFilenameBase64Url = bufferToBase64Url(encryptedFilename);
    const encryptedFiletypeHex = bufferToHex(encryptedFiletype);
    const cidOriginalBuffer = new TextEncoder().encode(cidOriginalStr);
    const cidOriginalEncryptedBuffer = await encryptBuffer(
      cidOriginalBuffer,
      personalSignature
    );

    if (!cidOriginalEncryptedBuffer) {
      toast.error("Failed to encrypt buffer");
      return null;
    }
    const cidOriginalEncryptedBase64Url = bufferToBase64Url(
      cidOriginalEncryptedBuffer
    );
    const encryptedFileBlob = new Blob([encryptedFileBuffer]);
    const encryptedFile = new File(
      [encryptedFileBlob],
      encryptedFilenameBase64Url,
      { type: encryptedFiletypeHex, lastModified: fileLastModified }
    );

    let encryptedWebkitRelativePath = "";
    if (isFolder) {
      const pathComponents = file.webkitRelativePath.split("/");
      const encryptedPathComponents = [];
      for (const component of pathComponents) {
        // If this component has been encrypted before, use the cached value
        if (encryptedPathsMapping[component]) {
          encryptedPathComponents.push(encryptedPathsMapping[component]);
        } else {
          const encryptedComponentBuffer = await encryptBuffer(
            new TextEncoder().encode(component),
            personalSignature
          );
          if (!encryptedComponentBuffer) {
            toast.error("Failed to encrypt buffer");
            return null;
          }
          const encryptedComponentHex = bufferToHex(encryptedComponentBuffer);
          encryptedPathsMapping[component] = encryptedComponentHex;
          encryptedPathComponents.push(encryptedComponentHex);
        }
      }

      // Reconstruct the encrypted webkitRelativePath
      encryptedWebkitRelativePath = encryptedPathComponents.join("/");
    }

    return {
      encryptedFile,
      cidOfEncryptedBufferStr,
      cidOriginalEncryptedBase64Url,
      encryptedWebkitRelativePath,
      encryptionTime,
    };
  };

  const postData = (formData: FormData) => {
    // console.log(formData);
    //the below thisEncryptionEnabled is not updated for some reason

    Api.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    })
      .then((data) => {
        toast.success("upload Succeed!");
        console.log(data);
        dispatch(
          setUploadStatusAction({
            info: "Finished uploading data",
            uploading: false,
          })
        );
        fetchRootContent();
        fetchUserDetail();
      })
      .catch((err) => {
        console.log(err);
        toast.error("upload failed!");
      })
      .finally(() => dispatch(setUploadStatusAction({ uploading: false })));
  };

  const handleFileUpload = async (files: any, isFolder: boolean) => {
    if (files.length === 0) return;

    const root = getRoot();

    const formData = new FormData();
    formData.append("root", root);

    let personalSignature;

    // console.log(encryptionEnabled);
    // return;

    if (thisEncryptionEnabledRef.current) {
      personalSignature = await getPersonalSignature(
        name,
        thisAutoEncryptionEnabledRef.current,
        accountType,
        logout
      );
      if (!personalSignature) {
        toast.error("Failed to get personal signature");
        logout();
        return;
      }
    }

    const encryptedPathsMapping: { [path: string]: string } = {};

    let encryptionTimeTotal = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (thisEncryptionEnabledRef.current) {
        const infoText = `Encrypting file ${i + 1} of ${files.length}`;
        dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
        const encryptedResult = await handleEncryption(
          file,
          personalSignature,
          isFolder,
          encryptedPathsMapping
        );
        if (!encryptedResult) {
          toast.error("Failed to encrypt file");
          return;
        }
        const {
          encryptedFile,
          cidOfEncryptedBufferStr,
          cidOriginalEncryptedBase64Url,
          encryptedWebkitRelativePath,
          encryptionTime,
        } = encryptedResult;

        encryptionTimeTotal += encryptionTime;

        formData.append("encryptedFiles", encryptedFile);
        formData.append(`cid[${i}]`, cidOfEncryptedBufferStr);
        formData.append(
          `cidOriginalEncrypted[${i}]`,
          cidOriginalEncryptedBase64Url
        );
        formData.append(
          `webkitRelativePath[${i}]`,
          encryptedWebkitRelativePath
        );
      } else {
        const uint8ArrayBuffer = new Uint8Array(await file.arrayBuffer());
        const cidStr = await getCid(uint8ArrayBuffer);
        formData.append(`cid[${i}]`, cidStr);
        formData.append("files", file);
      }
    }

    //parse encryption total of all files with encrypted option
    if (encryptionTimeTotal > 0) {
      let encryptionSuffix = "milliseconds";
      if (encryptionTimeTotal >= 1000 && encryptionTimeTotal < 60000) {
        encryptionTimeTotal /= 1000;
        encryptionSuffix = "seconds";
      } else if (encryptionTimeTotal >= 60000) {
        encryptionTimeTotal /= 60000;
        encryptionSuffix = "minutes";
      }
      const encryptionTimeParsed =
        "Encrypting the data took " +
        encryptionTimeTotal.toFixed(2).toString() +
        " " +
        encryptionSuffix;
      toast.success(`${encryptionTimeParsed}`);
    }

    const infoText = isFolder
      ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
      : files.length === 1
      ? files[0].name
      : `uploading ${files.length} files`;

    dispatch(setUploadStatusAction({ info: infoText, uploading: true }));
    postData(formData);
  };

  const onDrop = useCallback((acceptedFiles: any[]) => {
    // console.log(localStorage.getItem("encryptionEnabled")); 
    handleFileUpload(acceptedFiles, false);      

    // Do something with the files
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({ onDrop });

  return (
    <div
      className={[
        "flex-col items-center justify-center p-8 border-2 rounded-sm border-dashed bg-gray-50 outline-none mb-5 hidden sm:flex",
        `${getColor(isFocused, isDragAccept, isDragReject)}`,
      ].join(" ")}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-center">Drop the files here ...</p>
      ) : (
        <p className="text-center">Drag'n drop to upload, or click here</p>
      )}
    </div>
  );
}

export default Dropzone;