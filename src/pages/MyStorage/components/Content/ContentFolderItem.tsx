import { Api } from "api";
import { Folder } from "api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    HiDotsVertical,
    HiOutlineDownload,
    HiOutlineShare,
    HiOutlineTrash, HiOutlineLockOpen,
    HiLockClosed
} from "react-icons/hi";
import { toast } from "react-toastify";
import { useAuth, useDropdown } from "hooks";
import { useRef, useState, Fragment, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "state";
import {
    removeFolder, setSelectedShareFile,
    setSelectedShareFolder,
    setShowShareModal
} from "state/mystorage/actions";
import { truncate, formatDate } from "utils/format";
import { Theme } from "state/user/reducer";
import { DeleteFolderModal } from "components/Modals/DeleteItem/DeleteFolder";
import { useModal } from "components/Modal";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { FaFolder } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import { downloadFolderMultipart, folderDownload } from "utils/foldersDownload";
import { FolderContentClass } from "pages/Shared/Utils/types";
import useGetFolderFiles from "pages/Shared/Utils/useGetFolderFiles";
const MULTIPART_THRESHOLD =
	import.meta.env.VITE_MULTIPART_THRESHOLD || 1073741824; // 1GiB

dayjs.extend(relativeTime);

interface FolderItemProps {
    actionsAllowed: boolean;
    folder: Folder;
    view: "list" | "grid";
}

const ContentFolderItem: React.FC<FolderItemProps> = ({ folder, view, actionsAllowed }) => {
    const dispatch = useAppDispatch();
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [deleteAcepted, setDeleteAcepted] = useState(false);
    const [onPresent] = useModal(
        <DeleteFolderModal
            folder={folder}
            setDeleteAcepted={setDeleteAcepted}
        />
    );
    const { name } = useAppSelector((state) => state.user);
    const { autoEncryptionEnabled } = useAppSelector(
        (state) => state.userdetail
    );
    const { logout } = useAuth();
    const accountType = getAccountType();
    useDropdown(ref, open, setOpen);
    const { cache } = useAppSelector((state) => state.mystorage);

	const [selectedSharedFiles, setselectedSharedFiles] = useState<FolderContentClass>()
	const [start, setStart] = useState<boolean>(false)
	const [trigger, setTrigger] = useState<boolean>(false)
	const [selectedShareFolder, setselectedShareFolder] = useState<Folder>()
	const [folderAContent, setFolderContent] = useState<FolderContentClass>(new FolderContentClass(undefined, undefined));
	const { folderContent } = useGetFolderFiles(start, trigger, setTrigger, selectedShareFolder, folderAContent, setFolderContent);

	useEffect(() => {
		if (folderContent.files?.length !== 0) {
			setselectedSharedFiles(folderContent);
		}
	}, [trigger]);


	const handleDownload = async () => {
		toast.info("Downloading folder...");
		//trigger the preload of the content of the folder using the getFolderFiles hook
		setselectedShareFolder(folder)
		setFolderContent(new FolderContentClass(folder, undefined))
		setStart(true)
	};

	useEffect(() => {
		async function downloadFolderTrigger() {
			if (start && selectedSharedFiles && selectedShareFolder && trigger) {
				setTrigger(false);
				setStart(false);
				const personalSignature = await getPersonalSignature(
					name,
					autoEncryptionEnabled,
					accountType,
					logout
				);
				if (!personalSignature) {
					toast.error("Failed ta get personal signature");
					return;
				}

				if (selectedSharedFiles.getFolderTotalSize() > MULTIPART_THRESHOLD) {
					// TODO test download folder multipart
                    downloadFolderMultipart(selectedShareFolder, dispatch, personalSignature);
				}else{
					folderDownload(personalSignature,selectedShareFolder,dispatch, logout, name, autoEncryptionEnabled, accountType, cache, folderAContent);
				}
			}
		}

		downloadFolderTrigger();
	}, [start, selectedSharedFiles, trigger]);


    const handleDelete = () => {
        if (deleteAcepted) {
            // Make a request to delete the file
            Api.delete(`/folder/${folder.uid}`)
                .then(() => {
                    // Show a success message
                    toast.success("Folder deleted successfully!");
                    // Fetch the root content again
                    dispatch(removeFolder(folder.uid));
                    setDeleteAcepted(false);
                })
                .catch((err) => {
                    console.error("Error deleting folder:", err);
                    // Show an error message
                    toast.error("Error deleting folder!");
                });
        }
    };

    useEffect(() => {
        handleDelete();
    }, [deleteAcepted]);

    const { theme } = useAppSelector((state) => state.user);

    if (view === "list")
        return (
            <>
                <td
                    scope="row"
                    className={"px-3 font-medium whitespace-nowrap "
                        + (theme === Theme.DARK ? " text-white" : " text-gray-900")}
                >
                    <div className="flex items-center gap-3 " title="Double click to open">
                        <FaFolder
                            className="inline-block mr-2 align-middle"
                            size={24}
                            color={(theme === Theme.DARK ? "#ffffff" : "#272727")}
                        />
                        <span className="mr-2" >
                            {folder.is_in_pool && (
                                <GoAlertFill
                                    style={{ color: "#FF6600" }}
                                    title="Folder is in Hello Pool"
                                />
                            )}
                        </span>
                        <span className="inline content-text">
                            {truncate(folder.title, 24)}
                        </span>
                    </div>
                </td>
                <td className="py-1 pr-8">
                </td>
                <td className="py-1 pr-8 whitespace-nowrap">
                </td>
                <td className="py-1 pr-8">
                    <div className="flex items-center">
                        {folder.encryption_status === "public" ? (
                            <Fragment>
                                <HiOutlineLockOpen />
                                Public
                            </Fragment>
                        ) : (
                            <Fragment>
                                <HiLockClosed />
                                Encrypted
                            </Fragment>
                        )}
                    </div>
                </td>
                <td className="py-1 pr-8 whitespace-nowrap">
                    {dayjs(formatDate(folder.updated_at)).fromNow()}
                </td>
                <td className="py-1 pr-8 text-right h-[46px]">
                    {actionsAllowed && (
                        <button
                            className={"p-3 rounded-full "
                                + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                            onClick={() => setOpen(!open)}
                        >
                            <HiDotsVertical />
                            <div className="drop-down-menu" ref={ref}>
                                {open && (
                                    <ul
                                        id="dropdown"
                                        className={"absolute right-0 z-[100] mt-2 text-left origin-top-right divide-y shadow w-36 border"
                                            + (theme === Theme.DARK ? " dark-theme4" : " bg-white")}
                                    >
                                        <li className="block">
                                            <button
                                                className={"block px-4 py-2 w-full text-left "
                                                    + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-100")}
                                                onClick={handleDownload}
                                            >
                                                <HiOutlineDownload className="inline-flex mr-3" />
                                                Download
                                            </button>
                                        </li>
                                        {!folder.is_in_pool && (
                                            <li className="block">
                                                <button
                                                    onClick={() => {
                                                        dispatch(
                                                            setShowShareModal(true)
                                                        );
                                                        dispatch(
                                                            setSelectedShareFile()
                                                        )
                                                        dispatch(
                                                            setSelectedShareFolder(folder)
                                                        );
                                                    }}
                                                    className={"block px-4 py-2 w-full text-left "
                                                        + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
                                                >
                                                    <HiOutlineShare className="inline-flex mr-3" />
                                                    Share
                                                </button>
                                            </li>
                                        )}
                                        <li className="block">
                                            <button
                                                className={"block px-4 py-2 w-full text-left "
                                                    + (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-100")}
                                                onClick={onPresent}
                                            >
                                                <HiOutlineTrash className="inline-flex mr-3" />
                                                Delete
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </button>
                    )}
                </td>
            </>
        );
    else
        return (
            <div title="Double click to open">
                <div className="flex flex-col items-center gap-3">
                    <div className={"flex items-center w-full gap-2 overflow-hidden font-medium text-center whitespace-nowrap overflow-ellipsis"
                        + (theme === Theme.DARK ? " text-white" : "  text-gray-900")}
                    >
                        <FaFolder
                            className="inline-block mr-2 align-middle"
                            size={24}
                            color={(theme === Theme.DARK ? "#ffffff" : "#272727")}
                        />
                        <span className="mr-2" >
                            {folder.is_in_pool && (
                                <GoAlertFill
                                    style={{ color: "#FF6600" }}
                                    title="Folder is in Hello Pool"
                                />
                            )}
                        </span>
                        <span className="hidden md:inline content-text">
                            {truncate(folder.title, 40)}
                        </span>
                        <span className="inline md:hidden content-text">
                            {truncate(folder.title, 24)}
                        </span>
                    </div>

                    <div
                        className="gap-1 mt-3 text-xs"
                    >
                        <label>
                            {dayjs(formatDate(folder.updated_at)).fromNow()}</label>
                    </div>
                </div>
            </div>
        );
};

export default ContentFolderItem;
