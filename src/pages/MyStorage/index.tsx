import { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocation } from "react-router-dom";
import {
  HiDocumentDuplicate,
  HiDocumentText,
  HiOutlineViewGrid,
  HiOutlineViewList,
} from "react-icons/hi";
import { ContextMenu } from "components";
import Files from "./components/Files";
import Breadcrumb from "./components/Breadcrumb";
import Dropzone from "./components/Dropzone";
import { formatUID } from "utils";
import { useAppSelector } from "state";

import { useFetchData } from "hooks";

dayjs.extend(relativeTime);

export default function Home() {
  const location = useLocation();

  const mystorage = useAppSelector((state) => state.mystorage);
  const { fetchRootContent, fetchUserDetail } = useFetchData();

  useEffect(() => {
    fetchUserDetail();
  }, []);

  useEffect(() => {
    fetchRootContent();
  }, [fetchRootContent, location]);

  return (
    <div className="flex flex-col flex-1">
      <Dropzone />
      <div className="flex justify-between">
        <Breadcrumb />

        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700">
            Filter
          </button>

          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700"
            >
              <HiOutlineViewList size={20} />
            </button>

            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-l-0 border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700"
            >
              <HiOutlineViewGrid size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 mt-3 overflow-hidden">
        <div className="hidden md:flex flex-col flex-1">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-100">
              <tr>
                <th scope="col" className="p-3 rounded-tl-lg rounded-bl-lg">
                  Name
                </th>
                <th scope="col" className="p-1">
                  CID
                </th>
                <th scope="col" className="p-1">
                  Size
                </th>
                <th scope="col" className="py-1 px-3">
                  Type
                </th>
                <th scope="col" className="p-1 whitespace-nowrap">
                  Last Modified
                </th>
                <th scope="col" className="rounded-tr-lg rounded-br-lg"></th>
              </tr>
            </thead>
            <Files folders={mystorage.folders} files={mystorage.files} />
          </table>
          <div className="flex-1" id="right">
            <ContextMenu targetId="right" />
          </div>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-4 pb-16">
          {/* Card view for smaller screens */}
          {mystorage?.files.map((v, i) => (
            <div
              className="bg-white p-4 rounded-md mb-3 border border-gray-200 shadow-md"
              key={i}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-1 bg-gray-100 rounded-md">
                  <HiDocumentText className="w-7 h-7" />
                </div>
                <div className="font-medium text-gray-900 w-full">{v.name}</div>
              </div>
              <div className="flex items-center mt-4 text-xs gap-2">
                {formatUID(v.uid)} <HiDocumentDuplicate />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
