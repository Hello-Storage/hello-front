import { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PublicIcon } from "components";
import {
  HiDocumentDuplicate,
  HiDotsVertical,
  HiDocumentText,
} from "react-icons/hi";
import { formatBytes, formatUid } from "utils";
import { useAppSelector } from "state";

import { useRoot } from "hooks";

dayjs.extend(relativeTime);

export default function Home() {
  const response = useAppSelector((state) => state.dashboard);
  const { fetchRootContent } = useRoot();

  useEffect(() => {
    fetchRootContent();
  }, []);

  return (
    <div>
      <h1 className="text-xl">My Storage</h1>
      <div className="relative mt-3 overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-2">
                  Name
                </th>
                <th scope="col" className="px-6 py-2">
                  CID
                </th>
                <th scope="col" className="px-6 py-2">
                  Size
                </th>
                <th scope="col" className="px-6 py-2">
                  Type
                </th>
                <th scope="col" className="px-6 py-2 whitespace-nowrap">
                  Last Modified
                </th>
                <th scope="col" className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {response?.files.map((v, i) => (
                <tr className="bg-white" key={i}>
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1 bg-gray-100 rounded-md">
                        <HiDocumentText className="w-5 h-5" />
                      </div>
                      {v.name}
                    </div>
                  </th>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {formatUid(v.uid)}
                      <HiDocumentDuplicate />
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatBytes(v.size)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <PublicIcon /> Public
                    </div>
                  </td>
                  <td className="px-6 py-4">{dayjs(v.UpdatedAt).fromNow()}</td>
                  <td className="px-3 py-4">
                    <HiDotsVertical />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                {formatUid(v.uid)} <HiDocumentDuplicate />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
