import { FaFile } from "react-icons/fa";
import { HiCheckCircle, HiChevronDown, HiOutlineX } from "react-icons/hi";
import useSWR from "swr";
import { ProgressBar, ProgressCircle } from "components";
import { useEffect } from "react";
import { convertJson2UploadStatus } from "utils/convert";
import { useAppDispatch, useAppSelector } from "state";
import { fetchUploadStatusAction } from "state/uploadstatus/actions";
import { formatPercent } from "utils";

export default function UploadInfo() {
  const { data, error } = useSWR("/file/upload");
  const dispatch = useAppDispatch();
  const { info } = useAppSelector((state) => state.uploadstatus);
  useEffect(() => {
    if (!data) return;

    const res = convertJson2UploadStatus(data);
    console.log(res);
    dispatch(fetchUploadStatusAction(res));
  }, [data]);

  return (
    <div className="absolute bg-white w-80 left-1/2 bottom-5">
      {/* <div className="bg-gray-100 rounded-t-xl p-2">
        <div className="flex items-center justify-between">
          <label>upload</label>
          <div>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <HiChevronDown size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>
      </div> */}

      {/* upload files */}
      <div>
        {info.map((v, i) => (
          <div className="p-2 border shadow-md" key={i}>
            <div className="flex items-center justify-between">
              <div className="">
                <FaFile className="inline-block mr-3" />
                <label>{v.name}</label>
              </div>
              <div className="">{formatPercent(v.read, v.size, 1)}</div>
            </div>

            <div className="mt-2">
              <ProgressBar
                className="h-1"
                percent={(v.read * 100) / v.size}
                color="bg-[#34a853]"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
