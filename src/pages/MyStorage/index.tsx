import { useEffect, useRef, useState } from "react";
import language from "languages/es.json"
import { useLanguage } from "languages/LanguageProvider";
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
  refreshAction,
  resetCache,
  setFileViewAction,
  setImageViewAction,
  setSelectedShareFile,
  setShowShareModal,
  updateDecryptedFilesAction,
  updateDecryptedFoldersAction
} from "state/mystorage/actions";
import { File as FileType, Folder } from "api";

import getAccountType from "api/getAccountType";
import {
  handleEncryptedFiles,
  handleEncryptedFolders,
} from "utils/encryption/filesCipher";
import { toast } from "react-toastify";
import getPersonalSignature from "api/getPersonalSignature";
import ShareModal from "pages/Shared/Components/ShareModal";
import { Theme } from "state/user/reducer";
import ShareFolderModal from "pages/Shared/Components/ShareFolderModal";
import { useModal } from "components/Modal";
import { CustomFileViewer } from "components/ImageView/CustomFileViewer";
import { Helmet } from "react-helmet";


export default function Home() {
  const {lang} = useLanguage()
  const dispatch = useAppDispatch();
  const { uploading } = useAppSelector((state) => state.uploadstatus);
  const { name } = useAppSelector((state) => state.user);
  const { autoEncryptionEnabled } = useAppSelector((state) => state.userdetail);
  const { logout } = useAuth();
  const accountType = getAccountType();
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useDropdown(ref, open, setOpen);

  const { fetchRootContent, fetchUserDetail } = useFetchData();
  const personalSignatureRef = useRef<string | undefined>();

  //pagination
  const [loading, setLoading] = useState(false);

  const { folders, files, showPreview, path, showShareModal, refresh } = useAppSelector(
    (state) => state.mystorage
  );

  const [itemsPerPage, setItemsPerPage] = useState(
    window.innerWidth < 768 ? 6 : window.innerWidth < 1024 ? 10 : 15
  );

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(
        window.innerWidth < 768 ? 6 : window.innerWidth < 1024 ? 10 : 15
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(itemsPerPage - 1);

  const [currentFiles, setCurrentFiles] = useState<FileType[]>([]);
  const [currentFolders, setCurrentFolders] = useState<Folder[]>([]);
  const [totalItems, setTotalItems] = useState(0); // folders.length + files.length
  const [totalPages, setTotalPages] = useState(0);

  const [personalSignatureDefined, setPersonalSignatureDefined] = useState(false);
  const hasCalledGetPersonalSignatureRef = useRef<boolean>(false);

  const [onPresent] = useModal(<CustomFileViewer
    files={currentFiles}
  />);

  useEffect(() => {
    if (showPreview && currentFiles.length > 0 && !showShareModal) {
      onPresent();
    }
  }, [showPreview]);

  useEffect(() => {
    dispatch(setImageViewAction({ show: false }));
    dispatch(resetCache())
    dispatch(setFileViewAction({ file: undefined }));
  }, [])


  async function fetchContent() {
    setLoading(true);

    const itemsPerPage = 10;

    const totalItemsTemp = files.length;
    const totalPagesTemp = Math.ceil(totalItemsTemp / itemsPerPage);
    setTotalItems(totalItemsTemp);
    setTotalPages(totalPagesTemp);

    const tempStartIndex =
      currentPage === 1 ? 0 : itemsPerPage + (currentPage - 2) * itemsPerPage;
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

    const currentEncryptedFolders = folders.slice(
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
      personalSignatureRef.current ?? "",
      name,
      autoEncryptionEnabled,
      accountType,
      logout
    );

    if (decryptedFiles && decryptedFiles.length > 0) {
      dispatch(updateDecryptedFilesAction(decryptedFiles));
    }

    setCurrentFiles(decryptedFiles ?? []);

    const decryptedFolders = await handleEncryptedFolders(
      currentEncryptedFolders,
      personalSignatureRef.current ?? "",
    );

    if (decryptedFolders && decryptedFolders.length > 0) {
      dispatch(updateDecryptedFoldersAction(decryptedFolders));
    }
    setCurrentFolders(decryptedFolders ?? []);

    if (!currentFiles || !currentFolders) {
      toast.error(language[lang]["1516"]);
      fetchRootContent(setLoading);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchContent().then(() => {
      setLoading(false);
      setPersonalSignatureDefined(true);
      setCurrentPage(1)
    });

  }, [path, files.length, folders.length]);

  const [isInitialLoad, setIsInitialLoad] = useState(true);


  useEffect(() => {
    if (!isInitialLoad && (window.location.href.includes("space/my-storage") || window.location.href.includes("space/folder"))) {
      fetchRootContent()
      dispatch(refreshAction(true))
    }

  }, [window.location.href]);

  useEffect(() => {
    if (isInitialLoad && (window.location.href.includes("space/my-storage") || window.location.href.includes("space/folder"))) {
      fetchRootContent()
      dispatch(refreshAction(true))
      setIsInitialLoad(false)
    }

  }, []);

  useEffect(() => {
    if (refresh) {
      fetchContent().then(() => {
        setLoading(false);
        setPersonalSignatureDefined(true);
        setCurrentPage(1)
        dispatch(refreshAction(false))
      });
    }

  }, [refresh]);

  const paginateContent = async () => {
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


    const filesStartIndex = Math.max(0, tempStartIndex);
    const filesItemsCount = itemsPerPage;

    const currentFiles = files.slice(
      filesStartIndex,
      filesStartIndex + filesItemsCount
    )

    const thisCurrentFolders = folders.slice(
      filesStartIndex,
      filesStartIndex + filesItemsCount
    )


    if (!currentFiles || !currentFolders) {
      toast.error(language[lang]["1516"]);
      fetchRootContent(setLoading);
    }

    const decryptedFiles = await handleEncryptedFiles(
      currentFiles,
      personalSignatureRef.current ?? "",
      name,
      autoEncryptionEnabled,
      accountType,
      logout
    );

    if (decryptedFiles && decryptedFiles.length > 0) {
      dispatch(updateDecryptedFilesAction(decryptedFiles));
    }


    const decryptedFolders = await handleEncryptedFolders(
      thisCurrentFolders,
      personalSignatureRef.current ?? "",
    );

    if (decryptedFolders && decryptedFolders.length > 0) {
      dispatch(updateDecryptedFoldersAction(decryptedFolders));
    }


    setCurrentFiles(decryptedFiles ?? []);
    setCurrentFolders(decryptedFolders ?? []);

    setLoading(false);
  }

  useEffect(() => {
    setCurrentFolders(folders);
  }, [folders.length, folders]);

  const mounted = useRef(false);

  useEffect(() => {
    paginateContent().then(() => {
      if (!mounted.current) {
        fetchContent().then(() => {

          setPersonalSignatureDefined(true);
          dispatch(refreshAction(false))
        })
        mounted.current = true;
      }
    })

  }, [files.length, folders.length, currentPage])

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
    dispatch(setShowShareModal(false));
    dispatch(setSelectedShareFile(undefined));
    if (personalSignatureDefined) {
      if (!personalSignatureRef.current) {
        return;
      }
      fetchRootContent();
    }

  }, []);

  const { theme } = useAppSelector((state) => state.user);

  return (
    <>
      <Helmet>
        <title>Space | hello.app</title>
        <link rel="canonical" href="https://hello.app" />
      </Helmet>
      <div className="flex flex-col overflow-hidden table-main " id="content">
        {showShareModal && <>
          <ShareModal />
          <ShareFolderModal />
        </>}
        <div className="flex justify-between items-center mb-[15px]">
          <Breadcrumb />
          <div className="flex flex-row items-center justify-evenly min-w-fit">
            <div ref={ref}>
              <button
                className={"px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:text-blue-700 focus:z-10 focus:ring-1 focus:ring-gray-300 focus:text-blue-700" + (theme === Theme.DARK ? " text-white hover:bg-[#32334b]" : " bg-white text-gray-900 hover:bg-gray-100")}
                onClick={() => setOpen(!open)}
              >
                {/* Filter */}
                {language[lang]["152"]}
              </button>

              {open && (
                <div className={"absolute mt-1 z-10 w-[150px] shadow divide-y border text-sm " + (theme === Theme.DARK ? " text-white bg-[#32334b]" : " bg-white text-gray-700")}>
                  <ul className="p-2">
                    <li>
                      <div className="flex items-center justify-between p-2">
                        <label
                          htmlFor="all"
                          className="text-sm font-medium text-gray-900 cursor-pointer dark:text-gray-300"
                        >
                          {/* All */}
                          {language[lang]["1518"]}
                          
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
                          {/* Public */}
                          {language[lang]["1519"]}


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
                          {/* Encrypted */}
                          {language[lang]["1520"]}

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
                className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg`
                  + (theme === Theme.DARK ? " text-white bg-[#030522] hover:bg-[#32334b]" + (view === "list" ? " !bg-[#32334b]" : "") :
                    " bg-white text-gray-900 hover:bg-gray-100" + (view === "list" ? " !bg-gray-100" : ""))}
              >
                <HiOutlineViewList size={20} />
              </button>

              <button
                type="button"
                onClick={() => setView("grid")}
                className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg`
                  + (theme === Theme.DARK ? " text-white bg-[#030522] hover:bg-[#32334b]" + (view === "grid" ? " !bg-[#32334b]" : "") :
                    " bg-white text-gray-900 hover:bg-gray-100" + (view === "grid" ? " !bg-gray-100" : ""))}
              >
                <HiOutlineViewGrid size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="position-sticky-left">
          <Dropzone />
        </div>

        <section className="invisible-scrollbar " id="scroll-invisible-section">
          <Content
            loading={loading}
            actionsAllowed={true}
            showHorizontalFolders={true}
            files={filteredFiles}
            folders={filteredFolders}
            view={view}
            showFolders={true}
            filesTitle={language[lang]["153"]} //Files
            identifier={1}
          />
        </section>
        <div className="flex-shrink-0 mb-0">
          <div className={"flex items-center justify-between mt-3 border-gray-200 text-sm border-t "
            + (theme === Theme.DARK ? " dark-theme" : " bg-white ")}>
            <div className="text-xs">
              {/* Showing // to // of // results */}
              {language[lang]["1510"]} {totalItems === 0 ? startIndex : startIndex + 1} {language[lang]["1511"]}{" "}
              {Math.min(endIndex, totalItems)} {language[lang]["1512"]} {totalItems} {language[lang]["1513"]}
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
                <span className="hidden md:inline">
                  {/* Prev */}
                  {language[lang]["1514"]}
                </span>
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
                <span className="hidden md:inline">
                  {/* Next */}
                  {language[lang]["1515"]}
                  </span>{" "}
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Info */}
        {uploading && <UploadProgress />}
      </div></>
  );
}