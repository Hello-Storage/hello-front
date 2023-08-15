import { useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiDocumentDuplicate,
  HiDotsVertical,
  HiDocumentText,
  HiFolder,
} from "react-icons/hi";
import { ContextMenu, PublicIcon } from "components";

import { formatBytes, formatUID } from "utils";
import { useAppSelector } from "state";

import { useRoot } from "hooks";

dayjs.extend(relativeTime);

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const response = useAppSelector((state) => state.dashboard);
  const { fetchRootContent } = useRoot();

  const onFolderClick = () => {};
  const onFolderDoubleClick = (folderUID: string) => {
    navigate(`/folder/${folderUID}`);
  };

  useEffect(() => {
    fetchRootContent();
  }, [location]);

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-xl">My Storage</h1>
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
            <tbody>
              {/* folders */}
              {response.folders.map((v, i) => (
                <tr
                  className="bg-white cursor-pointer border-b hover:bg-gray-100"
                  key={i}
                  onClick={onFolderClick}
                  onDoubleClick={() => onFolderDoubleClick(v.uid)}
                >
                  <th
                    scope="row"
                    className="px-3 py-1 font-medium text-gray-900 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-3 select-none">
                      <HiFolder className="w-8 h-8" color="#737373" />
                      {v.title}
                    </div>
                  </th>
                  <td className="p-1">
                    <div className="flex items-center gap-1 select-none">
                      {formatUID(v.uid)}
                      <HiDocumentDuplicate />
                    </div>
                  </td>
                  <td className="p-1">-</td>
                  <td className="p-1">
                    <div className="flex items-center select-none">
                      <PublicIcon /> Public
                    </div>
                  </td>
                  <td className="p-1 select-none">
                    {dayjs(v.UpdatedAt).fromNow()}
                  </td>
                  <td className="py-1 px-3 text-right">
                    <button className="rounded-full hover:bg-gray-300 p-3">
                      <HiDotsVertical />
                    </button>
                  </td>
                </tr>
              ))}
              {/* files */}
              {response?.files.map((v, i) => (
                <tr
                  className="bg-white cursor-pointer border-b hover:bg-gray-100 "
                  key={i}
                >
                  <th
                    scope="row"
                    className="px-3 py-1 font-medium text-gray-900 whitespace-nowrap"
                  >
                    <div className="flex items-center gap-3">
                      <HiDocumentText className="w-8 h-8" color="#3b82f6" />
                      {v.name}
                    </div>
                  </th>
                  <td className="p-1">
                    <div className="flex items-center gap-1">
                      {formatUID(v.uid)}
                      <HiDocumentDuplicate />
                    </div>
                  </td>
                  <td className="p-1">{formatBytes(v.size)}</td>
                  <td className="p-1">
                    <div className="flex items-center">
                      <PublicIcon /> Public
                    </div>
                  </td>
                  <td className="p-1">{dayjs(v.UpdatedAt).fromNow()}</td>
                  <td className="py-1 px-3 text-right">
                    <button className="rounded-full hover:bg-gray-300 p-3">
                      <HiDotsVertical />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
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
