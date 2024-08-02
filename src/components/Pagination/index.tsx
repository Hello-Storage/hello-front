import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { useAppSelector } from "state";
import language from "languages/languages.json"
import { useLanguage } from "languages/LanguageProvider";
import { Theme } from "state/user/reducer";

interface ContentProps {
    totalItems: number;
    startIndex: number;
    endIndex: number;
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Pagination: React.FC<ContentProps> = ({totalItems, startIndex, endIndex, currentPage = 1, totalPages, itemsPerPage, setCurrentPage}) => {
    const {lang} = useLanguage()
    const { theme } = useAppSelector((state) => state.user);


    return (
        <div className="flex-shrink-0 mb-[50px] sm:mb-0">
            <div className={"flex items-center justify-between py-2 mt-3 text-sm bg-white border-t border-gray-200"
                + (theme === Theme.DARK ? " dark-theme " : " ")}>
                <div className="text-xs">
                    {/* Showing // to // of // results  */}
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
    )
}

export default Pagination;