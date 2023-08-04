import { ChangeEventHandler, useRef } from "react";
import Toggle from "react-toggle";
import { toast } from "react-toastify";
import { ProgressBar } from "components";
import {
  HiFolderOpen,
  HiChevronDown,
  HiPlus,
  HiTrash,
  HiCloudUpload,
  HiCollection,
  HiGlobeAlt,
  HiCubeTransparent,
  HiCog,
} from "react-icons/hi";
import { Api } from "api";

import AlvaroPFP from "@images/alvaro.png";
import "react-toggle/style.css";
import useRoot from "hooks/useRoot";

export default function Sidebar() {
  const { fetchRootContent } = useRoot();

  const fileInput = useRef<HTMLInputElement>(null);
  const folderInput = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    console.log("click file input!");
    console.log(fileInput);
    fileInput.current?.click();
  };

  const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const files = event.target.files;
    if (!files) return;

    console.log(files);

    var formData = new FormData();
    formData.append("root", "/");
    for (const file of files) formData.append("files", file);

    Api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
      .then((data) => {
        console.log(data);
        toast.success("upload Succeed!");
        fetchRootContent();
      })
      .catch((err) => {
        console.log(err);
        toast.error("upload failed!");
      });
  };

  const handleFolderInputChange = () => {};

  return (
    <div className="flex flex-col rounded-xl h-full bg-[#F3F4F6] px-5 py-3">
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <img
              src={AlvaroPFP}
              alt="alvaro"
              className="rounded-full w-7 h-7"
            />

            <label>Álvaro Pintado</label>
          </div>

          <div className="">
            <HiChevronDown />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <label className="text-sm">Encryption on</label>

          <Toggle />
        </div>

        <hr className="my-4" />

        <div className="">
          <button
            className="flex items-center justify-center w-full p-3 text-white rounded-xl bg-gradient-to-b from-green-500 to-green-700"
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
          <button className="w-full p-3 text-white rounded-xl bg-gradient-to-b from-violet-500 to-violet-700">
            Buy storage
          </button>
        </div>
      </div>

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
  );
}
