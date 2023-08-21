import { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocation } from "react-router-dom";
import { HiDocumentDuplicate, HiDocumentText } from "react-icons/hi";
import { ContextMenu } from "components";

import { formatUID } from "utils";
import { useAppSelector } from "state";

import { useFetchData } from "hooks";
import Files from "./components/Files";
import Breadcrumb from "./components/Breadcrumb";

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
      <Breadcrumb />
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
