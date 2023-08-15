import { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocation } from "react-router-dom";
import {
  HiDocumentDuplicate,
  HiDocumentText,
} from "react-icons/hi";
import { ContextMenu } from "components";

import { formatUID } from "utils";
import { useAppSelector } from "state";

import { useRoot } from "hooks";
import Files from "./Files";

dayjs.extend(relativeTime);

export default function Home() {
  const location = useLocation();
  const response = useAppSelector((state) => state.dashboard);
  const { fetchRootContent } = useRoot();


  useEffect(() => {
    fetchRootContent();
  }, [location]);




  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-xl">My Storage</h1>
      <p>Dropdown index: {response.dropdownIndex}</p>
      <div className="flex flex-1 mt-3 overflow-hidden">
        <div className="hidden md:flex flex-col flex-1">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-200">
              <tr>
                <th scope="col" className="p-3">
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
                <th scope="col" className=""></th>
              </tr>
            </thead>
            <Files
              folders={response.folders}
              files={response.files}
            />
          </table>
          <div className="flex-1" id="right">
            <ContextMenu targetId="right" />
          </div>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-4 pb-16">
          {/* Card view for smaller screens */}
          {response?.files.map((v, i) => (
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
