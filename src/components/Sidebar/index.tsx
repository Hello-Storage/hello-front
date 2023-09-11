import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Toggle from "react-toggle";
import { toast } from "react-toastify";
import { HiPlus } from "react-icons/hi";
import FileUpload from "assets/images/Outline/File-upload.png";
import FolderPlus from "assets/images/Outline/Folder-plus.png";
import Folder from "assets/images/Outline/Folder.png";
import FolderLock from "assets/images/Outline/Folder-lock.png";
import Layout from "assets/images/Outline/Layout.png";
import Send from "assets/images/Outline/Send.png";
import Book from "assets/images/Outline/Book.png";
import Box from "assets/images/Outline/Box.png";
import Key from "assets/images/Outline/Key.png";
import Cloud from "assets/images/Outline/Cloud-upload.png";
import { FiX } from "react-icons/fi";
import { CreateFolderModal, ProgressBar } from "components";
import { useModal } from "components/Modal";
import { Api } from "api";
import { useFetchData, useDropdown, useAuth } from "hooks";
import {
  toggleEncryption,
  toggleAutoEncryption,
} from "state/userdetail/actions";

import LogoHello from "@images/beta.png";
import "react-toggle/style.css";
import { useAppDispatch, useAppSelector } from "state";
import { formatBytes, formatPercent } from "utils";
import getPersonalSignature from "api/getPersonalSignature";
import {
  bufferToBase64Url,
  bufferToHex,
  encryptBuffer,
  encryptFileBuffer,
  encryptMetadata,
  getCid,
} from "utils/encryption/filesCipher";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { AxiosProgressEvent } from "axios";
import getAccountType from "api/getAccountType";

const links1 = [
  {
    to: "/dashboard",
    icon: <img src={Layout} alt="custom icon" className="w-6 h-6" />,
    content: "Dashboard",
    available: true,
  },
  {
    to: "/my-storage",
    icon: <img src={FolderLock} alt="custom icon" className="w-6 h-6" />,
    content: "My storage",
    available: true,
  },
  {
    to: "/shared-with-me",
    icon: <img src={Send} alt="custom icon" className="w-6 h-6" />,
    content: "Shared with me",
    available: false,
  },
  {
    to: "/recent",
    icon: <img src={Box} alt="custom icon" className="w-6 h-6" />,
    content: "Recent",
    available: false,
  },
];

const links2 = [
  {
    to: "/api",
    outRef: false,
    icon: <img src={Key} alt="custom icon" className="w-6 h-6" />,
    content: "Api key",
    available: false,
  },
  {
    to: "/migration",
    outRef: false,
    icon: <img src={Cloud} alt="custom icon" className="w-6 h-6" />,
    content: "Migration",
    available: false,
  },
  {
    to: "https://hello-decentralized.gitbook.io/hello-documentation/",
    outRef: true,
    icon: <img src={Book} alt="custom icon" className="w-6 h-6" />,
    content: "Documentation",
    available: true,
  },
];

type SidebarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const {
    storageUsed,
    storageAvailable,
    encryptionEnabled,
    autoEncryptionEnabled,
  } = useAppSelector((state) => state.userdetail);
  const dispatch = useAppDispatch();
  const { fetchRootContent, fetchUserDetail } = useFetchData();
  const { name } = useAppSelector((state) => state.user);
  const accountType = getAccountType();

  const { logout } = useAuth();

  useEffect(() => {
    if (encryptionEnabled) {
      dispatch(toggleAutoEncryption(true));
    }
  }, [dispatch, encryptionEnabled]);

  const dropRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(dropRef, open, setOpen);

  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);
  const [onPresent] = useModal(<CreateFolderModal />);

  useEffect(() => {
    if (folderInput.current !== null) {
      folderInput.current.setAttribute("directory", "");
      folderInput.current.setAttribute("webkitdirectory", "");
    }
  }, [folderInput]);

  const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
    dispatch(
      setUploadStatusAction({
        read: progressEvent.loaded,
        size: progressEvent.total,
      })
    );
  };

  const handleFileUpload = () => {
    fileInput.current?.click();
  };

  const handleFolderUpload = () => {
    folderInput.current?.click();
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
    encryptionTimeParsed: string;
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
      encryptionTimeParsed,
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
      encryptionTimeParsed,
    };
  };

  const postData = (formData: FormData) => {
    Api.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    })
      .then((data) => {
        toast.success("upload Succeed!");
        fetchRootContent();
        fetchUserDetail();
      })
      .catch((err) => {
        toast.error("upload failed!");
      })
      .finally(() => dispatch(setUploadStatusAction({ uploading: false })));
  };

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isFolder: boolean
  ) => {
    const root = getRoot();
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    formData.append("root", root);

    let personalSignature;
    if (encryptionEnabled) {
      personalSignature = await getPersonalSignature(
        name,
        autoEncryptionEnabled,
        accountType
      );
      if (!personalSignature) {
        toast.error("Failed to get personal signature");
        logout();
        return;
      }
    }

    const encryptedPathsMapping: { [path: string]: string } = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (encryptionEnabled) {
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
          encryptionTimeParsed,
        } = encryptedResult;

        toast.success(`${encryptionTimeParsed}`);

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
    const infoText = isFolder
      ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
      : files.length === 1
      ? files[0].name
      : `uploading ${files.length} files`;

    dispatch(setUploadStatusAction({ info: infoText, uploading: true }));

    postData(formData);
  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    handleInputChange(event, false);
  };

  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    handleInputChange(event, true);
  };

  return (
    <div className="flex flex-col py-6 h-full bg-[#F3F4F6] px-16 md:px-6 w-full">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <label className="text-2xl font-semibold font-[Outfit]">
            Hello.storage
          </label>
          <img src={LogoHello} alt="beta" className="w-12 h-6" />
        </div>

        <div className="flex items-center justify-between mt-5">
          <label className="text-sm">
            Encryption {encryptionEnabled ? "ON" : "OFF"}
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              checked={encryptionEnabled}
              onChange={() => dispatch(toggleEncryption(!encryptionEnabled))}
              className={encryptionEnabled ? "encryption-on" : "encryption-off"}
              icons={false}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <label
            htmlFor="auto-signature"
            className={`text-sm ${encryptionEnabled ? "" : "text-gray-400"}`}
          >
            Automatic
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              id="auto-signature"
              checked={autoEncryptionEnabled}
              onChange={() =>
                dispatch(toggleAutoEncryption(!autoEncryptionEnabled))
              }
              disabled={!encryptionEnabled}
              className={
                autoEncryptionEnabled ? "automatic-on" : "automatic-off"
              }
              icons={false}
            />
          </div>
        </div>

        <hr className="my-4" />

        <div className="relative" ref={dropRef}>
          <button
            className="flex items-center gap-2 justify-center text-white w-full p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
            onClick={() => setOpen(!open)}
          >
            <HiPlus /> New
          </button>
          {open && (
            <div
              id="dropdown"
              aria-label="dropdown-list"
              className="absolute mt-1 z-10 w-full bg-white shadow divide-y border text-sm text-gray-700"
            >
              <div className="py-2">
                <div
                  className="block cursor-pointer px-4 py-2 hover:bg-gray-100"
                  onClick={onPresent}
                >
                  <img
                    src={FolderPlus}
                    alt="custom icon"
                    className="inline-flex mr-2 w-4 h-4"
                  />
                  New Folder
                </div>
              </div>
              <ul className="py-2" aria-labelledby="dropdownDefaultButton">
                <li>
                  <div
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleFileUpload}
                  >
                    <img
                      src={FileUpload}
                      alt="custom icon"
                      className="inline-flex mr-2 w-4 h-4"
                    />
                    File Upload
                  </div>
                </li>
                <li>
                  <div
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleFolderUpload}
                  >
                    <img
                      src={Folder}
                      alt="custom icon"
                      className="inline-flex mr-2 w-4 h-4"
                    />
                    Folder Upload
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        <hr className="my-4" />

        <div className="flex flex-col gap-1">
          {links1.map((v, i) => (
            <NavLink
              to={v.available ? v.to : "/#"}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-300" : ""} hover:bg-gray-200 rounded-xl
                ${v.available ? "" : "pointer-events-none"}`
              }
              key={i}
            >
              <div
                className={`flex items-center p-2 justify-between ${
                  v.available ? "" : "text-gray-500"
                }`}
              >
                <div className={`flex items-center gap-3`}>
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${
                      v.available ? "" : "text-gray-500"
                    }`}
                  >
                    {v.content}
                  </label>
                </div>
                {!v.available && (
                  <label className="text-sm bg-gray-200 px-2 rounded-full">
                    soon
                  </label>
                )}
              </div>
            </NavLink>
          ))}
        </div>

        <hr className="my-4" />

        <div className="flex flex-col gap-1">
          {links2.map((v, i) => (
            <NavLink
              to={v.to}
              target={v.outRef ? "_blank" : ""}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-300" : ""} hover:bg-gray-200 rounded-xl
                ${v.available ? "" : "pointer-events-none"}`
              }
              key={i}
            >
              <div
                className={`flex items-center p-2 justify-between ${
                  v.available ? "" : "text-gray-500"
                }`}
              >
                <div className={`flex items-center gap-3`}>
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${
                      v.available ? "" : "text-gray-500"
                    }`}
                  >
                    {v.content}
                  </label>
                </div>
                {!v.available && (
                  <label className="text-sm bg-gray-200 px-2 rounded-full">
                    soon
                  </label>
                )}
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <label>{formatBytes(storageUsed)} Used</label>

        <ProgressBar
          percent={(storageUsed * 100) / storageAvailable}
          className="bg-gray-200 h-2.5"
          color="bg-gray-400"
        />

        <label className="text-xs text-neutral-800">
          {formatPercent(storageUsed, storageAvailable)} used -{" "}
          {formatBytes(storageAvailable)} available
        </label>
        <div className="mt-4">
          <button className="text-white w-full p-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800">
            Buy storage
          </button>
        </div>
      </div>
      <div>
        <input
          ref={fileInput}
          type="file"
          id="file"
          onChange={handleFileInputChange}
          multiple={true}
          accept="*/*"
          hidden
        />
        <input
          ref={folderInput}
          type="file"
          id="folder"
          onChange={handleFolderInputChange}
          hidden
        />
      </div>
      <div className="mt-4 md:hidden absolute top-2 right-20">
        <button
          className="p-1 border rounded-xl bg-white"
          onClick={() => setSidebarOpen(false)}
        >
          <FiX size={24} />
        </button>
      </div>
    </div>
  );
}
