import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Toggle from "react-toggle";
import { toast } from "react-toastify";
import { HiPlus } from "react-icons/hi";
import { RiFolderUploadLine, RiFolderAddLine } from "react-icons/ri";
import { GoPeople } from "react-icons/go";
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
import { AccountType, Api } from "api";
import { useFetchData, useDropdown, useAuth } from "hooks";
import {
  toggleEncryption,
  toggleAutoEncryption,
} from "state/userdetail/actions";

import LogoHello from "@images/beta.png";
import HotReferral from "@images/hotreferral.png";
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
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

const links1 = [
  {
    to: "/space/dashboard",
    icon: <img src={Layout} alt="custom icon" className="w-6 h-6" />,
    content: "Dashboard",
    available: true,
  },
  {
    to: "/space/my-storage",
    icon: <img src={FolderLock} alt="custom icon" className="w-6 h-6" />,
    content: "My storage",
    available: true,
  },
  {
    to: "/space/referrals",
    icon: <GoPeople className="w-5 h-5" />,
    content: "Referrals",
    available: true,
    img: <img src={HotReferral} alt="beta" className="w-12 h-5" />,
  },
];

const links2 = [
  {
    to: "/space/shared-with-me",
    icon: <img src={Send} alt="custom icon" className="w-6 h-6" />,
    content: "Shared",
    available: false,
  },
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
  const navigate = useNavigate();

  const { logout } = useAuth();

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


  useEffect(() => {
    fetchUserDetail();
  }, []);

  const getRoot = () =>
    location.pathname.includes("/space/folder")
      ? location.pathname.split("/")[3]
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
    Api.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    })
      .then((data) => {
        toast.success("upload Succeed!");
        setSidebarOpen(false);
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

      if (encryptionEnabled) {
        const infoText = `Encrypting ${i + 1} of ${files.length}`;
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

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    handleInputChange(event, false);
    setSidebarOpen(false);
  };

  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    handleInputChange(event, true);
  };

  return (
    <div className="flex flex-col py-6 h-full bg-[#F3F4F6] px-8 md:px-6 w-full">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <label className="text-2xl font-semibold font-[Outfit]">
            hello.app
          </label>
          <img src={LogoHello} alt="beta" className="w-12 h-6" />
        </div>

        <div className="flex items-center justify-between mt-4">
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
            className={`text-sm ${encryptionEnabled && accountType === AccountType.Provider
              ? ""
              : "text-gray-400"
              }`}
          >
            Automatic
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              id="auto-signature"
              checked={
                autoEncryptionEnabled || !(accountType === AccountType.Provider)
              }
              onChange={() =>
                accountType === AccountType.Provider &&
                dispatch(toggleAutoEncryption(!autoEncryptionEnabled))
              }
              disabled={
                !(accountType === AccountType.Provider) || !encryptionEnabled
              }
              className={
                autoEncryptionEnabled ? "automatic-on" : "automatic-off"
              }
              icons={false}
            />
          </div>
        </div>

        <hr className="my-3" />

        <div className="relative" ref={dropRef}>
          <button
            className="flex items-center gap-2 justify-center text-white w-full p-3 rounded-xl text-sm bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 mt-3"
            onClick={handleFileUpload}
          >
            <HiPlus /> Upload files
          </button>
          <div className="flex gap-4 items-center mt-4">
            <Tippy content="Create Folder">
              <button
                className="flex items-center justify-center p-2 w-full rounded-xl text-xs bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={onPresent}
              >
                <div title="Upload folder">
                  <RiFolderAddLine className="h-6 w-6" />
                </div>
              </button>
            </Tippy>
            <Tippy content="Upload Folder">
              <button
                className="flex items-center justify-center txt-gray-800 p-2 w-full rounded-xl text-xs bg-gray-200 hover:bg-gray-300 text-gray-800"
                onClick={handleFolderUpload}
              >
                <RiFolderUploadLine className="h-6 w-6" />
              </button>
            </Tippy>
          </div>
        </div>

        <hr className="my-3" />

        <div className="flex flex-col gap-0.5">
          {links1.map((v, i) => (
            <NavLink
              to={v.to}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-200" : ""} hover:bg-gray-200 rounded-xl`
              }
              key={i}
            >
              <div
                className={`flex items-center px-2 py-1.5 justify-between ${v.available ? "" : "text-gray-500"
                  }`}
              >
                <div className={`flex items-center gap-3`}>
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${v.available ? "" : "text-gray-500"
                      }`}
                  >
                    {v.content}
                  </label>
                </div>
                {!v.available && !v.img ? (
                  <label className="text-sm bg-gray-200 px-2 rounded-full">
                    soon
                  </label>
                ) : (
                  <span>{v.img}</span>
                )}
              </div>
            </NavLink>
          ))}
        </div>

        <hr className="my-3" />

        <div className="flex flex-col gap-0.5">
          {links2.map((v, i) => (
            <NavLink
              to={v.to}
              target={v.outRef ? "_blank" : ""}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-200" : ""} hover:bg-gray-200 rounded-xl
                ${v.available ? "" : "pointer-events-none"}`
              }
              key={i}
            >
              <div
                className={`flex items-center px-2 py-1.5 justify-between ${v.available ? "" : "text-gray-500"
                  }`}
              >
                <div className={`flex items-center gap-3`}>
                  <span className="text-xl">{v.icon}</span>
                  <label
                    className={`text-sm cursor-pointer ${v.available ? "" : "text-gray-500"
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
          {formatPercent(storageUsed, storageAvailable)} /{" "}
          {formatBytes(storageAvailable)} used -&nbsp;
          <a
            href="/space/referrals"
            onClick={(e) => {
              e.preventDefault();
              navigate("/space/referrals");
            }}
            className="text-orange-500 cursor-pointer hover:underline"
          >
            {formatBytes(storageAvailable, 2, false)} / 100 GB
          </a>
        </label>
        <div className="mt-4 pb-1">
          <button
            className="text-white w-full p-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800"
            onClick={() => navigate("/space/referrals")}
            disabled={storageAvailable >= Math.pow(1024, 3) * 100}
          >
            Get {formatBytes(100 * Math.pow(1024, 3) - storageAvailable)} Free
            ✨
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
      <div className="mt-4 md:hidden absolute top-2 right-24">
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
