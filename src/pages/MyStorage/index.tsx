import { useEffect, useRef, useState } from "react";
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

import { useDropdown, useFetchData } from "hooks";
import Appbar from "components/Appbar";

dayjs.extend(relativeTime);

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  const location = useLocation();
  const mystorage = useAppSelector((state) => state.mystorage);
  const { fetchRootContent, fetchUserDetail } = useFetchData();

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalItems = mystorage.folders.length + mystorage.files.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

  const currentFolders = mystorage.folders.slice(startIndex, endIndex + 1);
  const remainingItems = itemsPerPage - currentFolders.length;
  const currentFiles = mystorage.files.slice(0, remainingItems);

  const [filter, setFilter] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");

  const filteredFolders = currentFolders.filter(
    (folder) =>
      folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = currentFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [view, setView] = useState("list");

  const onRadioChange = (e: any) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);

  useEffect(() => {
    fetchRootContent();
  }, [fetchRootContent, location]);

  return (
    <div className="flex flex-col flex-1">
      <Appbar onSearchChange={(e) => setSearchTerm(e.target.value)} />
      <Dropzone />
      <div className="flex justify-between">
        <Breadcrumb />

        <div className="flex gap-3">
          <div className="relative" ref={ref}>
            <button
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700"
              onClick={() => setOpen(!open)}
            >
              Filter
            </button>

            {open && (
              <div className="absolute mt-1 z-10 w-[150px] bg-white shadow divide-y border text-sm text-gray-700">
                <ul className="p-2">
                  <li>
                    <div className="flex items-center justify-between p-2">
                      <label
                        htmlFor="all"
                        className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        All
                      </label>
                      <input
                        type="radio"
                        id="all"
                        name="filter-radio"
                        value="all"
                        checked={filter === "all"}
                        onChange={onRadioChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                      />
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center justify-between p-2">
                      <label
                        htmlFor="public"
                        className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Public
                      </label>
                      <input
                        type="radio"
                        id="public"
                        name="filter-radio"
                        value="public"
                        checked={filter === "public"}
                        onChange={onRadioChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                      />
                    </div>
                  </li>
                  <li>
                    <div className="flex items-center justify-between p-2">
                      <label
                        htmlFor="encrypted"
                        className="cursor-pointer text-sm font-medium text-gray-900 dark:text-gray-300"
                      >
                        Encrypted
                      </label>
                      <input
                        type="radio"
                        id="encrypted"
                        name="filter-radio"
                        value="encrypted"
                        checked={filter === "encrypted"}
                        onChange={onRadioChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300"
                      />
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setView("list")}
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700"
            >
              <HiOutlineViewList size={20} />
            </button>

            <button
              type="button"
              onClick={() => setView("grid")}
              className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-l-0 border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700"
            >
              <HiOutlineViewGrid size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 mt-3">
        {view === "list" && (
          <div className="flex flex-col flex-1 max-h-screen">
            <div className="overflow-auto md:overflow-visible max-h-[calc(100vh-6rem)] custom-scrollbar">
              <table className="w-full text-sm text-left text-gray-500 table-with-lines">
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
                    <th
                      scope="col"
                      className="rounded-tr-lg rounded-br-lg"
                    ></th>
                  </tr>
                </thead>
                <Files folders={filteredFolders} files={filteredFiles} />
              </table>
            </div>
            <div className="flex-1" id="right">
              <ContextMenu targetId="right" />
            </div>
          </div>
        )}
        {view === "grid" && (
          <div className="flex flex-wrap justify-between pb-16">
            {filteredFolders.map((v, i) => (
              <div className="bg-white p-4 rounded-md mb-3 border border-gray-200 shadow-md w-64 flex flex-col justify-between h-[240px]">
                <div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-1 bg-gray-100 rounded-md">
                      <HiDocumentText className="w-7 h-7" />
                    </div>
                    <div className="font-medium text-gray-900 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
                      {v.title}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-auto text-xs gap-2">
                  {formatUID(v.uid)} <HiDocumentDuplicate />
                </div>
              </div>
            ))}
            {filteredFiles.map((v, i) => (
              <div className="bg-white p-4 rounded-md mb-3 border border-gray-200 shadow-md w-64 flex flex-col justify-between h-[240px]">
                <div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-1 bg-gray-100 rounded-md">
                      <HiDocumentText className="w-7 h-7" />
                    </div>
                    <div className="font-medium text-gray-900 w-full overflow-hidden whitespace-nowrap overflow-ellipsis">
                      {v.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center mt-auto text-xs gap-2">
                  {formatUID(v.uid)} <HiDocumentDuplicate />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/*Add buttons here */}
      <div className="flex justify-between items-center mt-3">
        <div>
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems) + 1} of{" "}
          {totalItems} results
        </div>
        <div className="fex space-x-2">
          <button
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-200"
            }`}
            onClick={() =>
              setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
            }
            disabled={currentPage === 1}
          >
            {"< "}Previous
          </button>
          <button
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-200"
            }`}
            onClick={() =>
              setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
