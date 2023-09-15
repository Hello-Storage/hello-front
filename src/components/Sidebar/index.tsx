import React, { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Toggle from "react-toggle";
import { toast } from "react-toastify";
import { HiPlus } from "react-icons/hi";
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
import { useFetchData, useDropdown } from "hooks";
import {
  toggleEncryption,
  toggleAutoEncryption,
} from "state/userdetail/actions";

import LogoHello from "@images/beta.png";
import "react-toggle/style.css";
import { useAppDispatch, useAppSelector } from "state";
import { formatBytes, formatPercent } from "utils";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { AxiosProgressEvent } from "axios";
import { decrypt, encrypt } from "utils/encrypt";

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
    content: "Shared",
    available: false,
  },
  {
    to: "/referrals",
    icon: <img src={Box} alt="custom icon" className="w-6 h-6" />,
    content: "Referrals",
    available: true,
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
  const { signature } = useAppSelector((state) => state.user);

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

  const uploadFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isFolder: boolean
  ) => {
    if (encryptionEnabled && signature == "") {
      toast.warning("didn't configure the signature");
      return;
    }

    const root = getRoot();
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    formData.append("root", root);

    if (encryptionEnabled) {
      formData.append("status", "encrypted");
    } else formData.append("status", "public");

    const salt = crypto.getRandomValues(new Uint8Array(8));
    for (let i = 0; i < files.length; i++) {
      let file = files[i];

      if (encryptionEnabled) file = await encrypt(file, signature, salt);

      formData.append("files", file);
    }

    const info = isFolder
      ? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
      : files.length === 1
      ? files[0].name
      : `uploading ${files.length} files`;

    dispatch(setUploadStatusAction({ info, uploading: true }));

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

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    uploadFiles(event, false);
  };

  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    uploadFiles(event, true);
  };

  return (
    <div className="flex flex-col py-6 h-full bg-[#F3F4F6] px-8 md:px-6 w-full">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <label className="text-2xl font-semibold font-[Outfit]">
            Hello.storage
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

        <hr className="my-3" />

        <div className="relative" ref={dropRef}>
          <button
            className="flex items-center gap-2 justify-center text-white w-full p-3 rounded-xl text-sm bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 mt-3"
            onClick={handleFileUpload}
          >
            <HiPlus /> File Upload
          </button>
          <div className="flex gap-2 items-center mt-4">
            <button
              className="flex items-center justify-center text-gray-800 w-full px-2 py-3 rounded-xl text-xs bg-white border border-gray-300 hover:bg-gray-100"
              onClick={onPresent}
            >
              New Folder
            </button>
            <button
              className="flex items-center justify-center text-gray-800 w-full px-2 py-3 rounded-xl text-xs bg-white border border-gray-300 hover:bg-gray-100"
              onClick={handleFolderUpload}
            >
              Folder upload
            </button>
          </div>
        </div>

        <hr className="my-3" />

        <div className="flex flex-col gap-0.5">
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
                className={`flex items-center px-2 py-1.5 justify-between ${
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

        <hr className="my-3" />

        <div className="flex flex-col gap-0.5">
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
                className={`flex items-center px-2 py-1.5 justify-between ${
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
          {formatPercent(storageUsed, storageAvailable)} / 10 GB used -&nbsp;
          <strong className="text-orange-500">
            {formatBytes(storageAvailable).slice(
              0,
              formatBytes(storageAvailable).length - 2
            )}{" "}
            / 100 GB
          </strong>
        </label>
        <div className="mt-4">
          <button className="text-white w-full p-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800">
            Get 90 GB Free ✨
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
