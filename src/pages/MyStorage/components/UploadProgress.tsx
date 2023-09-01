import { FaFile } from "react-icons/fa";
import { ProgressBar } from "components";
import { useAppSelector } from "state";
import { formatPercent } from "utils";

export default function UploadProgress() {
  const { read, size } = useAppSelector((state) => state.uploadstatus);
  return (
    <div className="absolute bg-white w-80 left-1/2 bottom-5 border shadow-md">
      <div>
        <div className="p-2">
          <div className="flex items-center justify-between">
            <div className="">
              <FaFile className="inline-block mr-3" />
              <label>v.name</label>
            </div>
            <div className="">{formatPercent(read, size, 1)}</div>
          </div>

          <div className="mt-2">
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
