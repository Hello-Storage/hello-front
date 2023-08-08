import Toggle from "react-toggle";
import {
  ProgressBar,
  HexIcon,
  ChevronDownIcon,
  PlusIcon,
  DirectoryIcon,
  ShareIcon,
  RecentIcon,
  TrashIcon,
  UploadIcon,
  SettingIcon,
} from "components";
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
              className="w-7 h-7 rounded-full"
            />
            <label>Álvaro Pintado</label>
          </div>

          <div className="">
            <ChevronDownIcon />
          </div>
        </div>

        <div className="flex items-center justify-between mt-5">
          <label className="text-sm">Encryption on</label>

          <Toggle icons={false} />
        </div>

        <hr className="my-4" />

        <div className="">
          <button className="flex items-center justify-center text-white w-56 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800">
            <PlusIcon /> Upload file
          </button>
        </div>

        <hr className="my-4" />

        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <DirectoryIcon />
            <label className="text-sm">My storage</label>
          </div>

          <div className="flex gap-3 items-center">
            <ShareIcon />
            <label className="text-sm">Shared with me</label>
          </div>

          <div className="flex gap-3 items-center">
            <RecentIcon />
            <label className="text-sm">Recent</label>
          </div>

          <div className="flex gap-3 items-center">
            <TrashIcon />
            <label className="text-sm">Deleted</label>
          </div>
        </div>

        <hr className="my-4" />

        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-center">
            <UploadIcon />
            <label className="text-sm">Migration</label>
          </div>
          <div className="flex gap-3 items-center">
            <SettingIcon />
            <label className="text-sm">Api key</label>
          </div>
        </div>
      </div>

      <div className="">
        <div className="flex items-center gap-1">
          <HexIcon /> <label>10 GB Used</label>
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
    </div>
  );
}
