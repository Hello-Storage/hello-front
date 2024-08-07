import { FaCopy, FaKey } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import useApikey from "./hooks/useApikey";
import { Api as axios, File as FileType} from "api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Content from "pages/MyStorage/components/Content";
import { useAppDispatch, useAppSelector } from "state";
import { refreshAction } from "state/mystorage/actions";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import ShareModal from "pages/Shared/Components/ShareModal";
import { Theme } from "state/user/reducer";
import { useModal } from "components/Modal";
import { CustomFileViewer } from "components/ImageView/CustomFileViewer";
import language from "languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";

export default function Api() {
    const {lang} = useLanguage()
    const [apiKey, setApiKey] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    const {
        refresh,
        showShareModal,
        showPreview,
    } = useAppSelector((state) => state.mystorage);
    useApikey(setApiKey)
    const [loading, setLoading] = useState(false);
    const [currentFiles, setCurrentFiles] = useState<FileType[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(
        window.innerWidth < 768 ? 6 : window.innerWidth < 1024 ? 10 : 15
    );
    const [startIndex, setStartIndex] = useState(0);
    const [endIndex, setEndIndex] = useState(itemsPerPage - 1);

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


    const handleGenerate = () => {
        axios.post<{ api_key: string; api_key_expires_at: string }>("/api_key").then((res) => {
            const { api_key } = res.data;
            setApiKey(api_key);
        });
    };

    useEffect(() => {
        if (apiKey) {
            setLoading(true)
            axios.get<{ files: FileType[], totalItems: number, totalPages: number }>("/file/apikey").then((res) => {
                const { files, totalItems, totalPages } = res.data;
                setCurrentFiles(files);
                setTotalItems(totalItems)
                setTotalPages(totalPages)
                setStartIndex(1)
                setLoading(false)
            }).catch(() => {
                setCurrentFiles([])
            }).finally(() => {
                dispatch(refreshAction(false))
            })
        }
    }, [refresh, apiKey])

    const [onPresent] = useModal(<CustomFileViewer
        files={currentFiles}
    />);

    useEffect(() => {
        if (showPreview && currentFiles.length > 0 && !showShareModal) {
            onPresent();
        }
    }, [showPreview]);

    const { theme } = useAppSelector((state) => state.user);

    return (<>

        {showShareModal && <ShareModal />}
        <section className="flex flex-col w-full h-full">
            <h3 className="my-2 text-xl">
                {/* Shared files */}
                {language[lang]["171"]}
            </h3>
            <div className="flex items-center w-full gap-4 h-fit">
                {!apiKey && (
                    <button
                        className="animated-bg-btn w-[230px] mb-2 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                        onClick={handleGenerate}
                    >
                        <span className="btn-transition"></span>
                        <label className="flex items-center justify-center w-full gap-2 text-sm text-white">
                            <FaKey className="animated-btn-icon" /> 
                            {/* Generate API KEY */}
                            {language[lang]["182"]}
                        </label>
                    </button>
                )}

                <button
                    className="animated-bg-btn w-[230px] mb-2 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                    onClick={() => {
                        window.open("https://docs.hello.app/api-key-documentation", '_blank')
                    }}
                >
                    <span className="btn-transition"></span>
                    <label className="flex items-center justify-center w-full gap-2 text-sm text-white">
                        <IoDocumentTextOutline className="animated-btn-icon" /> 
                        {/* View API documentation */}
                        {language[lang]["181"]}
                    </label>
                </button>
            </div>
            <div className="flex flex-row items-center justify-center w-full gap-3 h-fit">

                {apiKey && (
                    <>
                        <label htmlFor="apikey">
                            {/* Generated ApiKey: */}
                            {language[lang]["183"]}
                            </label>
                        <input className={"bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:border-gray-400 focus:outline-none block w-[300px] px-2.5 py-3"
                            + (theme === Theme.DARK ? " dark-theme3 " : " ")}
                            id="apikey" type="text" readOnly
                            value={apiKey}></input>
                        <button
                            className="animated-bg-btn min-w-[80px] w-min max-w-[100px] p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                            onClick={() => {
                                //copy to clipboard
                                navigator.clipboard.writeText(
                                    apiKey
                                );
                                toast.success(
                                    // "Api key copied to clipboard"
                                      language[lang]["186"]
                                );
                            }}
                        >
                            <span className="btn-transition"></span>
                            <label className="w-full flex items-center justify-center gap-2 text-sm text-white">
                                <FaCopy className="animated-btn-icon" />
                                 {/* Copy */}
                                 {language[lang]["184"]}
                            </label>
                        </button></>
                )}

            </div>


            <section className="flex-grow custom-scrollbar invisible-scrollbar" id="scroll-invisible-section">
                {/* Uploaded files */}
                <Content
                    actionsAllowed={false}
                    showHorizontalFolders={false}
                    loading={loading}
                    files={currentFiles}
                    folders={[]}
                    view={"list"}
                    showFolders={false}
                    filesTitle={language[lang]["185"]}
                    identifier={1}
                />
            </section>

            <div className="flex-shrink-0 mb-[50px] sm:mb-0">
                <div className={"flex items-center justify-between py-2 mt-3 text-sm bg-white border-t border-gray-200"
                    + (theme === Theme.DARK ? " dark-theme " : " ")}>
                    <div className="text-xs">
                        {/* Showing // to // of // results */}
                        {language[lang]["1510"]} {totalItems === 0 ? startIndex : startIndex + 1} {language[lang]["1512"]}{" "}
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
                            {language[lang]["1515"]}
                                </span>{" "}
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    </>

    )
}
