import { FaFile } from "react-icons/fa";
import { HiCheckCircle, HiChevronDown, HiOutlineX } from "react-icons/hi";
import useSWR from "swr";
import { ProgressCircle } from "components";
import { useEffect } from "react";
import { convertJson2UploadStatus } from "utils/convert";
import { useAppDispatch, useAppSelector } from "state";
import { fetchUploadStatusAction } from "state/uploadstatus/actions";

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
    <div className="absolute bg-white w-80 right-6 bottom-0 border rounded-t-xl">
      <div className="bg-gray-100 rounded-t-xl p-2">
        <div className="flex items-center justify-between">
          <label>uploads complete</label>
          <div>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <HiChevronDown size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-200">
              <HiOutlineX size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* upload files */}
      <div>
        {info.map((v, i) => (
          <div className="flex items-center justify-between p-2" key={i}>
            <div className="flex items-center">
              <FaFile className="inline-block mr-3" />
              <label className="w-56 overflow-hidden text-ellipsis whitespace-nowrap break-words">
                {v.name}
              </label>
            </div>
            <div className="">
              <div className="p-1">
                <ProgressCircle
                  className="w-6 h-6"
                  percent={(v.read * 100) / v.size}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between p-2">
          <div>
            <FaFile className="inline-block mr-3" />
            ape.jpg
          </div>

          <div className="">
            <HiCheckCircle size={32} color="#34a853" />
          </div>
        </div>
      </div>
    </div>
  );
}
