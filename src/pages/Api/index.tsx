import { FaCopy, FaKey } from "react-icons/fa";
import { IoDocumentTextOutline } from "react-icons/io5";
import useApikey from "./hooks/useApikey";
import { Api as axios } from "api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Content from "pages/MyStorage/components/Content";
import { File as FileType } from "api";
import Imageview from "components/ImageView/Imageview";
import { useAppDispatch, useAppSelector } from "state";
import { refreshAction } from "state/mystorage/actions";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export default function Api() {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    const { showPreview, refresh } = useAppSelector(
        (state) => state.mystorage
    );

    useApikey(setApiKey)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState(false);
    const [loaded, setloaded] = useState(false);
    const [currentFiles, setCurrentFiles] = useState<FileType[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(
        window.innerWidth < 768 ? 6 : window.innerWidth < 1024 ? 10 : 15
    );
    const [startIndex, setStartIndex] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            axios.get<{ files: FileType[],totalItems: number ,totalPages: number }>("/file/apikey").then((res) => {
                const { files, totalItems,totalPages } = res.data;
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

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh])


    return (
        <section className="flex flex-col w-full h-full">
            <h3 className="my-2 text-xl">Shared files</h3>
            <div className="flex items-center w-full gap-4 h-fit">
                {!apiKey && (
                    <button
                        className="animated-bg-btn w-[230px] mb-2 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                        onClick={handleGenerate}
                    >
                        <span className="btn-transition"></span>
                        <label className="flex items-center justify-center w-full gap-2 text-sm text-white">
                            <FaKey className="animated-btn-icon" /> Generate API KEY
                        </label>
                    </button>
                )}

                <button
                    className="animated-bg-btn w-[230px] mb-2 p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                    onClick={() => {
                        console.log("test");
                    }}
                >
                    <span className="btn-transition"></span>
                    <label className="flex items-center justify-center w-full gap-2 text-sm text-white">
                        <IoDocumentTextOutline className="animated-btn-icon" /> View API documentation
                    </label>
                </button>
            </div>
            <div className="flex flex-row items-center justify-center w-full gap-3 h-fit">

                {apiKey && (
                    <>
                        <label htmlFor="apikey">Generated ApiKey:</label>
                        <input className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:border-gray-400 focus:outline-none block w-[300px] px-2.5 py-4"
                            id="apikey" type="text" readOnly
                            value={apiKey}></input>
                        <button
                            className="animated-bg-btn min-w-[80px] w-[80px] p-3 rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                            onClick={() => {
                                //copy to clipboard
                                navigator.clipboard.writeText(
                                    apiKey
                                );
                                toast.success(
                                    "Api key copied to clipboard"
                                );
                            }}
                        >
                            <span className="btn-transition"></span>
                            <label className="flex items-center justify-center w-full gap-2 text-sm text-white">
                                <FaCopy className="animated-btn-icon" /> Copy
                            </label>
                        </button></>
                )}

            </div>


            <section className="flex-grow custom-scrollbar invisible-scrollbar" id="scroll-invisible-section">
                <Content
                    loading={loading}
                    files={currentFiles}
                    folders={[]}
                    view={"list"}
                    showFolders={false}
                    filesTitle="Uploaded files"
                    identifier={1}
                    setloaded={setloaded}
                />
            </section>

            <div className="flex-shrink-0 mb-[50px] sm:mb-0">
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
            {/* lightbox */}
            <Imageview
                isOpen={showPreview}
                files={currentFiles}
                loaded={loaded}
                setloaded={setloaded}
            ></Imageview>
        </section>
    )
}
