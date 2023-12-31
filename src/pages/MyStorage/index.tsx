import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  HiChevronLeft,
  HiChevronRight,
  HiOutlineViewGrid,
  HiOutlineViewList,
} from "react-icons/hi";
import Content from "./components/Content";
import Breadcrumb from "./components/Breadcrumb";
import Dropzone from "./components/Dropzone";
import { useAppDispatch, useAppSelector } from "state";
import { useSearchContext } from "contexts/SearchContext";

import { useAuth, useDropdown, useFetchData } from "hooks";
import UploadProgress from "./components/UploadProgress";
import {
  updateDecryptedFilesAction,
  updateDecryptedFoldersAction
} from "state/mystorage/actions";
import { File as FileType, Folder } from "api";

// import styles
import "lightbox.js-react/dist/index.css";
import getAccountType from "api/getAccountType";
import {
  handleEncryptedFiles,
  handleEncryptedFolders,
} from "utils/encryption/filesCipher";
import { toast } from "react-toastify";
import getPersonalSignature from "api/getPersonalSignature";
import { useNavigate } from "react-router-dom";
import ShareModal from "pages/Shared/Components/ShareModal";
import Imageview from "components/ImageView/Imageview";


export default function Home() {

  const [loaded, setloaded] = useState(false);

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

  const { folders, files, showPreview, path, showShareModal } = useAppSelector(
    (state) => state.mystorage
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    window.innerWidth < 768 ? 6 : 10
  );


  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(itemsPerPage - 1);

  const [currentFiles, setCurrentFiles] = useState<FileType[]>([]);
  const [currentFolders, setCurrentFolders] = useState<Folder[]>([]);
  const [totalItems, setTotalItems] = useState(0); // folders.length + files.length
  const [totalPages, setTotalPages] = useState(0);

  const [personalSignatureDefined, setPersonalSignatureDefined] = useState(false);
  const hasCalledGetPersonalSignatureRef = useRef<boolean>(false);


  useEffect(() => {
    async function fetchContent() {
      setLoading(true);

      const itemsPerPage = 10;

      const totalItemsTemp = files.length;
      const totalPagesTemp = Math.ceil(totalItemsTemp / itemsPerPage);
      setTotalItems(totalItemsTemp);
      setTotalPages(totalPagesTemp);

      const tempStartIndex =
        currentPage === 1 ? 0 : 10 + (currentPage - 2) * itemsPerPage;
      const tempEndIndex = tempStartIndex + itemsPerPage;

      setStartIndex(tempStartIndex);
      setEndIndex(Math.min(tempEndIndex, totalItemsTemp));

      // Calculate starting index for files based on the number of folders taken.
      const filesStartIndex = Math.max(0, tempStartIndex);

      // Slice the files array based on the calculated start and end indices.
      const currentEncryptedFiles = files.slice(
        filesStartIndex,
        filesStartIndex + itemsPerPage
      );


      if (!personalSignatureRef.current && !hasCalledGetPersonalSignatureRef.current) {
        hasCalledGetPersonalSignatureRef.current = true;

        personalSignatureRef.current = await getPersonalSignature(
          name,
          autoEncryptionEnabled,
          accountType
        );//Promie<string | undefined>
        if (!personalSignatureRef.current) {
          toast.error("Failed to get personal signature");
          logout();
          return;
        }
      }

      const decryptedFiles = await handleEncryptedFiles(
        currentEncryptedFiles,
        personalSignatureRef.current || "",
        name,
        autoEncryptionEnabled,
        accountType,
        logout
      );

      if (decryptedFiles && decryptedFiles.length > 0) {
        dispatch(updateDecryptedFilesAction(decryptedFiles));
      }

      setCurrentFiles(decryptedFiles || []);

      const decryptedFolders = await handleEncryptedFolders(
        folders,
        personalSignatureRef.current || "",
      );

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
      setPersonalSignatureDefined(true);
    });
  }, [path, currentPage]);
  useEffect(() => {
    if (personalSignatureDefined) {
      if (!personalSignatureRef.current) {
        return;
      }
      console.log(location.pathname);
      fetchRootContent();
      setCurrentPage(1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, name, personalSignatureRef.current]);

  const paginateContent = async () => {
    const itemsPerPage = 10;

    const totalItemsTemp = files.length;
    const totalPagesTemp = Math.ceil(totalItemsTemp / itemsPerPage);
    setTotalItems(totalItemsTemp);
    setTotalPages(totalPagesTemp);

    const tempStartIndex =
      currentPage === 1 ? 0 : 10 + (currentPage - 2) * itemsPerPage;
    const tempEndIndex = tempStartIndex + itemsPerPage;

    setStartIndex(tempStartIndex);
    setEndIndex(Math.min(tempEndIndex, totalItemsTemp));


    const filesStartIndex = Math.max(0, tempStartIndex);
    const filesItemsCount = itemsPerPage;

    const currentFiles = files.slice(
      filesStartIndex,
      filesStartIndex + filesItemsCount
    )

    if (!currentFiles || !currentFolders) {
      toast.error("Failed to decrypt content");
      fetchRootContent(setLoading);
    }

    setCurrentFiles(currentFiles);

    setCurrentFolders(currentFolders);

  }

  useEffect(() => {
    setCurrentFolders(folders);
  }, [folders.length]);

  useEffect(() => {
    paginateContent();
  }, [files.length])


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
		if (personalSignatureDefined) {
			if (!personalSignatureRef.current) {
				return;
			}
			fetchRootContent();
		}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <div className="flex flex-col overflow-hidden table-main ">
      {showShareModal && <ShareModal />}
      <div className="flex justify-between mb-[15px]">
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
                        className="text-sm font-medium text-gray-900 cursor-pointer dark:text-gray-300"
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
                        className="text-sm font-medium text-gray-900 cursor-pointer dark:text-gray-300"
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
                        className="text-sm font-medium text-gray-900 cursor-pointer dark:text-gray-300"
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
              className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 ${view === "list" ? "!bg-gray-100" : ""
                }`}
            >
              <HiOutlineViewList size={20} />
            </button>

            <button
              type="button"
              onClick={() => setView("grid")}
              className={`px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-l-0 border-gray-200 rounded-r-md hover:bg-gray-100 ${view === "grid" ? "!bg-gray-100" : ""
                }`}
            >
              <HiOutlineViewGrid size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="position-sticky-left">
        <Dropzone />
      </div>

      <section className="flex-grow custom-scrollbar invisible-scrollbar" id="scroll-invisible-section">
        <Content
          loading={loading}
          files={filteredFiles}
          folders={filteredFolders}
          view={view}
          showFolders={true}
          filesTitle="Files"
          identifier={1}
          setloaded={setloaded}
        />
      </section>
      {/* Sticky footer */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between py-2 mt-3 text-sm bg-white border-t border-gray-200">
          <div className="text-xs">
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
              <HiChevronLeft className="w-5 h-5" />
              <span className="hidden md:inline">Prev</span>
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
              <span className="hidden md:inline">Next</span>{" "}
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Info */}
      {uploading && <UploadProgress />}

      {/* lightbox */}
      <Imageview
        isOpen={showPreview}
        files={filteredFiles}
        loaded={loaded}
        setloaded={setloaded}
      ></Imageview>
    </div>
  );
}