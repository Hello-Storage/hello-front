import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineViewGrid,
  HiOutlineViewList,
} from "react-icons/hi";
import { SlideshowLightbox } from "lightbox.js-react";
import Content from "./components/Content";
import Breadcrumb from "./components/Breadcrumb";
import Dropzone from "./components/Dropzone";
import { useAppDispatch, useAppSelector } from "state";
import { useSearchContext } from "contexts/SearchContext";

import { useAuth, useDropdown, useFetchData } from "hooks";
import UploadProgress from "./components/UploadProgress";
import { setImageViewAction, updateDecryptedFilesAction, updateDecryptedFoldersAction } from "state/mystorage/actions";
import { File as FileType, Folder } from "api";

// import styles
import "lightbox.js-react/dist/index.css";
import getAccountType from "api/getAccountType";
import { handleEncryptedFiles, handleEncryptedFolders } from "utils/encryption/filesCipher";
import { toast } from "react-toastify";

export default function Home() {
  const dispatch = useAppDispatch();
  const { uploading } = useAppSelector((state) => state.uploadstatus);
  const { name } = useAppSelector((state) => state.user);
  const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);
  const { logout } = useAuth();
  const accountType = getAccountType();

  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  const location = useLocation();

  const { fetchRootContent, fetchUserDetail } = useFetchData();
  const personalSignatureRef = useRef<string | undefined>();

  //pagination
  const [loading, setLoading] = useState(false);

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

  const { folders, files, showPreview, preview } = useAppSelector(
    (state) => state.mystorage
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(window.innerWidth < 768 ? 6 : 10);

  const totalItems = folders.length + files.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(itemsPerPage - 1);


  const [currentFiles, setCurrentFiles] = useState<FileType[]>([]);
  const [currentFolders, setCurrentFolders] = useState<Folder[]>([]);



  useEffect(() => {
  async function fetchContent() {
    setLoading(true);

    const tempStartIndex = (currentPage - 1) * itemsPerPage;
    const tempEndIndex = tempStartIndex + itemsPerPage;

    setStartIndex(tempStartIndex);
    setEndIndex(Math.min(tempEndIndex, totalItems));

    // Calculate the number of folders and files to display on the current page.
    let folderItemsCount = Math.min(folders.length - tempStartIndex, itemsPerPage);
    folderItemsCount = Math.max(0, folderItemsCount); // Ensure it's not negative

    // Slice the folders array to get the items to display on the current page.
    const currentEncryptedFolders = folders.slice(tempStartIndex, tempStartIndex + folderItemsCount);

    // Calculate starting index for files based on the number of folders taken.
    const filesStartIndex = Math.max(0, tempStartIndex - folders.length);
    const filesItemsCount = itemsPerPage - folderItemsCount; // Remaining space on the page

    // Slice the files array based on the calculated start and end indices.
    const currentEncryptedFiles = files.slice(filesStartIndex, filesStartIndex + filesItemsCount);

    const decryptedFiles = await handleEncryptedFiles(currentEncryptedFiles, personalSignatureRef, name, autoEncryptionEnabled, accountType, logout);

    if (decryptedFiles && decryptedFiles.length > 0) {
      dispatch(updateDecryptedFilesAction(decryptedFiles));
    }

    setCurrentFiles(decryptedFiles || []);

    const decryptedFolders = await handleEncryptedFolders(currentEncryptedFolders, personalSignatureRef);

    if (decryptedFolders && decryptedFolders.length > 0) {
      dispatch(updateDecryptedFoldersAction(decryptedFolders));
    }
    setCurrentFolders(decryptedFolders || []);

    if (!currentFiles || !currentFolders) {
      toast.error("Failed to decrypt content");
      fetchRootContent(setLoading);
    }
  }
  fetchContent().then(() => {
    setLoading(false);
  });
}, [logout, name, currentPage, folders.length, files.length]);

  useEffect(() => {
    setCurrentPage(1);
    fetchRootContent()

  }, [location])


  const [filter, setFilter] = useState("all");

  const { searchTerm } = useSearchContext();

  const filteredFolders = currentFolders.filter(
    (folder) =>
      folder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = currentFiles?.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.cid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [view, setView] = useState<"list" | "grid">("list");



  const onRadioChange = (e: any) => {
    setFilter(e.target.value);
  };

  useEffect(() => {
    fetchUserDetail();
  }, []);


  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-col flex-1 overflow-y-auto">
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
          <Content
            loading={loading}
            files={filteredFiles}
            folders={filteredFolders}
            view={view}
          />
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center mt-3 px-4 py-2 bg-white border-t border-gray-200">
          <div>
            Showing {totalItems === 0 ? startIndex : startIndex + 1} to{" "}
            {Math.min(endIndex, totalItems)} of {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              className={`p-2 rounded flex items-center gap-2 ${currentPage === 1
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-200"
                }`}
              onClick={() =>
                setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))
              }
              disabled={currentPage === 1}
            >
              <HiChevronLeft className="h-5 w-5" />
              <span className="md:inline hidden">Prev</span>
            </button>
            <button
              className={`p-2 rounded flex items-center gap-2 ${totalPages === 0 || currentPage === totalPages
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-gray-200"
                }`}
              onClick={() =>
                setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages))
              }
              disabled={totalPages === 0 || currentPage === totalPages}
            >
              <span className="md:inline hidden">Next</span>{" "}
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Info */}
      {uploading && <UploadProgress />}

      {/* lightbox */}
      <SlideshowLightbox
        images={preview == undefined ? [] : [preview]}
        showThumbnails={false}
        showThumbnailIcon={false}
        open={showPreview}
        lightboxIdentifier="lbox1"
        backgroundColor="#0f0f0fcc"
        iconColor="#ffffff"
        modalClose="clickOutside"
        onClose={() => {
          dispatch(setImageViewAction({ show: false }));
        }}
      />
    </div >
  );
}
