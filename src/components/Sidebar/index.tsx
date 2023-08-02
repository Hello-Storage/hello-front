import Toggle from "react-toggle";
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
import AlvaroPFP from "@images/alvaro.png";

import "react-toggle/style.css";

export default function Sidebar() {
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
          <button className="flex items-center justify-center w-full p-3 text-white rounded-xl bg-gradient-to-b from-green-500 to-green-700">
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
    </div>
  );
}
