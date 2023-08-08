import { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PublicIcon } from "components";
import {
  HiDocumentDuplicate,
  // HiFolder,
  HiDotsVertical,
  HiDocumentText,
  // HiPhotograph,
} from "react-icons/hi";
import { formatBytes, formatUid } from "utils";
import { useAppSelector } from "state";

import useRoot from "hooks/useRoot";

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
      <div className="relative mt-3 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 ">
          <div className="text-xs uppercase bg-gray-50 rounded-lg">
            <table className="w-full">
              <thead className="text-xs text-gray-700 ">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    CID
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Last Modified
                  </th>
                  <th scope="col" className="px-6 py-3"></th>
                </tr>
              </thead>
            </table>
          </div>
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
                  <div className="flex items-center">
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
                <td className="px-6 py-4">
                  <HiDotsVertical />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
