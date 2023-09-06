import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocation } from "react-router-dom";
import { HiOutlineViewGrid, HiOutlineViewList } from "react-icons/hi";
import Content from "./components/Content";
import Breadcrumb from "./components/Breadcrumb";
import Dropzone from "./components/Dropzone";
import { useAppSelector } from "state";
import { useSearchContext } from "contexts/SearchContext";

import { useDropdown, useFetchData } from "hooks";
import UploadProgress from "./components/UploadProgress";

dayjs.extend(relativeTime);

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  const location = useLocation();
  const mystorage = useAppSelector((state) => state.mystorage);
  const { uploading } = useAppSelector((state) => state.uploadstatus);
  const { fetchRootContent, fetchUserDetail } = useFetchData();

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      // Set itemsPerPage to 5 if window width is less than 768px (mobile), else set it to 10 (desktop)
      setItemsPerPage(window.innerWidth < 768 ? 6 : 10);
    };

    // Attach event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalItems = mystorage.folders.length + mystorage.files.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, totalItems - 1);

  const currentFolders = mystorage.folders.slice(startIndex, endIndex + 1);
  const remainingItems = itemsPerPage - currentFolders.length;
  const currentFiles = mystorage.files.slice(0, remainingItems);

  const [filter, setFilter] = useState("all");

  const { searchTerm } = useSearchContext();

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

  const [view, setView] = useState<"list" | "grid">("list");

  const onRadioChange = (e: any) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);

  useEffect(() => {
    fetchRootContent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <div className="flex flex-col flex-1">
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
      <div className="flex flex-1 flex-col mt-3">
        <Content files={filteredFiles} folders={filteredFolders} view={view} />
      </div>
      {/*Add buttons here */}
      <div className="flex justify-between items-center mt-3">
        <div>
          Showing {totalItems === 0 ? startIndex : startIndex + 1} to{" "}
          {Math.min(endIndex, totalItems) + 1} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            className={`px-4 py-2 rounded flex items-center ${
              currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-200"
            }`}
            onClick={() =>
              setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
            }
            disabled={currentPage === 1}
          >
            {"< "}Prev
          </button>
          <button
            className={`px-4 py-2 rounded flex items-center ${
              totalPages === 0 || currentPage === totalPages
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-200"
            }`}
            onClick={() =>
              setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
            }
            disabled={totalPages === 0 || currentPage === totalPages}
          >
            Next {">"}
          </button>
        </div>
      </div>

      {/* Upload Info */}
      {uploading && <UploadProgress />}
    </div>
  );
}
