import { FaFile } from "react-icons/fa";
import { ProgressBar } from "components";
import { useAppSelector } from "state";
import { formatPercent } from "utils";

export default function UploadProgress() {
  const { info, read, size } = useAppSelector((state) => state.uploadstatus);
  return (
    <div className="absolute bg-white w-96 left-1/2 bottom-5 border border-gray-200 shadow-md rounded-lg transform -translate-x-1/2">
      <div className="flex flex-col justify-center h-full"> 
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaFile className="inline-block mr-2 text-gray-700" />
              <label className={`w-92 whitespace-nowrap overflow-hidden text-gray-800 ${info.length >= 32 && "text-ellipsis"}`}>
                {info.length > 128 ? info.substring(0, 128) + "..." : info}
              </label>
            </div>
            <div className="">{formatPercent(read, size, 1)}</div>
          </div>
          <div className="mt-2 flex justify-center"> 
            <ProgressBar
              className="h-1"
              percent={(read * 100) / size}
              color="bg-[#34a853]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

