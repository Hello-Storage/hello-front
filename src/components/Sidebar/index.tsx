import { ChangeEventHandler, useRef } from "react";
import Toggle from "react-toggle";
import { toast } from "react-toastify";
import {
  HiFolderOpen,
  HiPlus,
  HiTrash,
  HiCloudUpload,
  HiCollection,
  HiGlobeAlt,
  HiCubeTransparent,
  HiCog,
} from "react-icons/hi";
import { ProgressBar } from "components";
import { Api } from "api";
import { useRoot } from "hooks";

import LogoHello from "@images/LogoHello.png";
import "react-toggle/style.css";
import { NavLink } from "react-router-dom";

const links = [
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
    icon: <HiCloudUpload />,
    content: "Migration",
  },
  {
    to: "/api",
    icon: <HiCog />,
    content: "Api key",
  },
];

import React, { useState } from "react";
import { HiLockClosed, HiLockOpen } from "react-icons/hi";

type SidebarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const { fetchRootContent } = useRoot();
  const [isEncryptionOn, setEncryptionOn] = useState(false);


  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    fileInput.current?.click();
  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const files = event.target.files;
    if (!files) return;

    var formData = new FormData();
    formData.append("root", "/");
    for (const file of files) formData.append("files", file);

    Api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((data) => {
        toast.success("upload Succeed!");
        fetchRootContent();
      })
      .catch((err) => {
        toast.error("upload failed!");
      });
  };

  const handleFolderInputChange = () => {};

  return (
    <div className="flex flex-col rounded-xl h-full bg-[#F3F4F6] px-16 md:px-5 py-3 w-full">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <img src={LogoHello} alt="alvaro" className="w-[88px] h-7" />
        </div>

        <div className="flex items-center justify-between mt-5">
          <label className="text-sm">Encryption  {isEncryptionOn ? "ON" : "OFF"}</label>
          <div className="flex items-center">
            <Toggle
              checked={isEncryptionOn}
              onChange={() => setEncryptionOn(!isEncryptionOn)}
              className={isEncryptionOn ? "encryption-on" : "encryption-off"}
            />
            <label className="text-sm ml-2">
            </label>
          </div>
        </div>
        <hr className="my-4" />

        <div className="">
          <button
            className="flex items-center gap-2 justify-center text-white w-56 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
            onClick={handleUpload}
          >
            <HiPlus /> Upload file
          </button>
        </div>

        <hr className="my-4" />

        <div className="flex flex-col gap-1">
          {links.map((v) => (
            <NavLink
              to={v.to}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-300" : ""} hover:bg-gray-200 rounded-xl`
              }
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
          {links2.map((v) => (
            <NavLink
              to={v.to}
              className={({ isActive }) =>
                `${isActive ? "bg-gray-300" : ""} hover:bg-gray-200 rounded-xl`
              }
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
        <div className="flex items-center gap-1">
          <HiCubeTransparent /> <label>10 GB Used</label>
        </div>
        <ProgressBar />

        <label className="text-xs text-neutral-800">
          20% used - 40 GB available
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
