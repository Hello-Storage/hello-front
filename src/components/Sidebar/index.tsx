import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Toggle from "react-toggle";
import { toast } from "react-toastify";
import {
  HiFolderOpen,
  HiPlus,
  HiTrash,
  HiCloudUpload,
  HiCollection,
  HiGlobeAlt,
  HiBookOpen,
  HiCog,
  HiFolderAdd,
  HiDocumentDownload,
  HiFolderDownload,
} from "react-icons/hi";
import { CreateFolderModal, ProgressBar } from "components";
import { useModal } from "components/Modal";
import { Api } from "api";
import { useFetchData, useDropdown } from "hooks";

import LogoHello from "@images/logo.png";
import "react-toggle/style.css";
import { useAppSelector } from "state";
import { formatBytes, formatPercent } from "utils";

const links1 = [
  {
    to: "/my-storage",
    icon: <HiFolderOpen />,
    content: "My storage",
  },
  {
    to: "/shared-with-me",
    icon: <HiGlobeAlt />,
    content: "Shared with me",
  },
  {
    to: "/recent",
    icon: <HiCollection />,
    content: "Recent",
  },
  {
    to: "/deleted",
    icon: <HiTrash />,
    content: "Deleted",
  },
];

const links2 = [
  {
    to: "/migration",
    outRef: false,
    icon: <HiCloudUpload />,
    content: "Migration",
  },
  {
    to: "/api",
    outRef: false,
    icon: <HiCog />,
    content: "Api key",
  },
  {
    to: "https://hello-decentralized.gitbook.io/hello-documentation/",
    outRef: true,
    icon: <HiBookOpen />,
    content: "Documentation",
  },
];

type SidebarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const { storageUsed, storageAvailable } = useAppSelector(
    (state) => state.userdetail
  );
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
    formData.append("root", "/");
    for (const file of files) formData.append("files", file);

    Api.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((data) => {
        toast.success("upload Succeed!");
        fetchRootContent();
        fetchUserDetail();
      })
      .catch((err) => {
        toast.error("upload failed!");
      });
  };

  const handleFolderInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const files = event.target.files;
    if (!files) return;

    const formData = new FormData();
    formData.append("root", "/");
    for (const file of files) formData.append("files", file);

    Api.post("/file/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((data) => {
        toast.success("upload Succeed!");
        fetchRootContent();
        fetchUserDetail();
      })
      .catch((err) => {
        toast.error("upload failed!");
      });
  };

  return (
    <div className="flex flex-col rounded-xl h-full bg-[#F3F4F6] px-16 md:px-5 py-3 w-full">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <img src={LogoHello} alt="alvaro" className="w-7 h-7 rounded-full" />
          <label className="text-2xl font-semibold font-[Outfit]">
            Hello.storage
          </label>
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
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <label
          htmlFor="auto-signature"
          className={`text-sm ${isEncryptionOn ? '' : 'text-gray-400'}`}
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
                  <HiFolderAdd className="inline-flex mr-3" />
                  New Folder
                </div>
              </div>
              <ul className="py-2" aria-labelledby="dropdownDefaultButton">
                <li>
                  <div
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleFileUpload}
                  >
                    <HiDocumentDownload className="inline-flex mr-3" />
                    File Upload
                  </div>
                </li>
                <li>
                  <div
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={handleFolderUpload}
                  >
                    <HiFolderDownload className="inline-flex mr-3" />
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
              to={v.to}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-300" : ""} hover:bg-gray-200 rounded-xl`
              }
              key={i}
            >
              <div className="flex items-center gap-3  p-2">
                {v.icon}
                <label className="text-sm cursor-pointer">{v.content}</label>
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
                `${isActive ? "bg-gray-300" : ""} hover:bg-gray-200 rounded-xl`
              }
              key={i}
            >
              <div className="flex items-center gap-3  p-2">
                {v.icon}
                <label className="text-sm cursor-pointer">{v.content}</label>
              </div>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="">
        <label>{formatBytes(storageUsed)} Used</label>

        <ProgressBar percent={(storageUsed * 100) / storageAvailable} />

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
      <div className="mt-4 md:hidden">
        <button
          className="w-56 py-2 border-y border-gray-300"
          onClick={() => setSidebarOpen(false)}
        >
          Close Sidebar
        </button>
      </div>
    </div>
  );
}
