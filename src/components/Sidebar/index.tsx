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

type SidebarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export default function Sidebar({ setSidebarOpen }: SidebarProps) {
  const { fetchRootContent } = useRoot();

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
          <label className="text-sm">Encryption on</label>

          <Toggle icons={false} />
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

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <HiFolderOpen />
            <label className="text-sm">My storage</label>
          </div>

          <div className="flex items-center gap-3">
            <HiGlobeAlt />
            <label className="text-sm">Shared with me</label>
          </div>

          <div className="flex items-center gap-3">
            <HiCollection />
            <label className="text-sm">Recent</label>
          </div>

          <div className="flex items-center gap-3">
            <HiTrash />
            <label className="text-sm">Deleted</label>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <HiCloudUpload />
            <label className="text-sm">Migration</label>
          </div>
          <div className="flex items-center gap-3">
            <HiCog />
            <label className="text-sm">Api key</label>
          </div>
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
