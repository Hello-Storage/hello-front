import { ChangeEventHandler, useEffect, useRef, useState } from "react";
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
import { useFetchData, useDropdown } from "hooks";

import LogoHello from "@images/beta.png";
import "react-toggle/style.css";
import { useAppDispatch, useAppSelector } from "state";
import { formatBytes, formatPercent } from "utils";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { AxiosProgressEvent } from "axios";

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
  const { storageUsed, storageAvailable } = useAppSelector(
    (state) => state.userdetail
  );
  const dispatch = useAppDispatch();
  const { fetchRootContent, fetchUserDetail } = useFetchData();
  const [isEncryptionOn, setEncryptionOn] = useState(false);
  const [isAutomaticOn, setAutomaticOn] = useState(false);

  useEffect(() => {
    if (!isEncryptionOn) {
      setAutomaticOn(false);
    }
  }, [isEncryptionOn]);

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
        size: progressEvent.total!,
      })
    );
  };

  const handleFileUpload = () => {
    fileInput.current?.click();
  };

  const handleFolderUpload = () => {
    folderInput.current?.click();
  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const files = event.target.files;

    if (!files) return;

    const formData = new FormData();

    let root = "/";

    if (location.pathname.includes("/folder")) {
      root = location.pathname.split("/")[2];
    }

    formData.append("root", root);
    for (const file of files) formData.append("files", file);

    if (files.length === 1)
      dispatch(setUploadStatusAction({ info: files[0].name, uploading: true }));
    else
      dispatch(
        setUploadStatusAction({
          info: `uploading ${files.length} files`,
          uploading: true,
        })
      );

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

  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const files = event.target.files;
    if (!files) return;

    console.log(files);
    const formData = new FormData();

    let root = "/";

    if (location.pathname.includes("/folder")) {
      root = location.pathname.split("/")[2];
    }

    formData.append("root", root);

    const folder = files[0].webkitRelativePath.split("/")[0];
    for (const file of files) formData.append("files", file);
    dispatch(
      setUploadStatusAction({
        info: `uploading ${folder} folder`,
        uploading: true,
      })
    );
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

  return (
    <div className="flex flex-col rounded-xl h-full bg-[#F3F4F6] px-16 md:px-5 py-3 w-full">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <label className="text-2xl font-semibold font-[Outfit]">
            Hello.storage
          </label>
          <img src={LogoHello} alt="beta" className="w-12 h-6" />
        </div>

        <div className="flex items-center justify-between mt-5">
          <label className="text-sm">
            Encryption {isEncryptionOn ? "ON" : "OFF"}
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              checked={isEncryptionOn}
              onChange={() => setEncryptionOn(!isEncryptionOn)}
              className={isEncryptionOn ? "encryption-on" : "encryption-off"}
              icons={false}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <label
            htmlFor="auto-signature"
            className={`text-sm ${isEncryptionOn ? "" : "text-gray-400"}`}
          >
            Automatic
          </label>
          <div className="flex items-center align-middle">
            <Toggle
              id="auto-signature"
              checked={isAutomaticOn}
              onChange={() => setAutomaticOn(!isAutomaticOn)}
              disabled={!isEncryptionOn}
              className={isAutomaticOn ? "automatic-on" : "automatic-off"}
              icons={false}
            />
          </div>
        </div>

        <hr className="my-4" />

        <div className="relative" ref={dropRef}>
          <button
            className="flex items-center gap-2 justify-center text-white w-56 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
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

      <div className="">
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
          <button className="text-white w-56 p-3 rounded-xl bg-gradient-to-b from-violet-500 to-violet-700 hover:from-violet-600 hover:to-violet-800">
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
      <div className="mt-4 md:hidden absolute top-3 right-10">
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
