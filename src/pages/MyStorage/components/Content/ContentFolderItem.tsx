import { Api } from "api";
import { EncryptionStatus, Folder } from "api/types";
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
import {
    decryptContent,
    decryptFileBuffer,
    decryptMetadata,
    hexToBuffer
} from "utils/encryption/filesCipher";
import { useAppDispatch, useAppSelector } from "state";
import {
    removeFolder, setSelectedShareFile,
    setSelectedShareFolder,
    setShowShareModal
} from "state/mystorage/actions";
import { truncate, formatDate } from "utils/format";
import { Theme } from "state/user/reducer";
import { logoutUser } from "state/user/actions";
import JSZip from "jszip";
import { DeleteFolderModal } from "components/Modals/DeleteItem/DeleteFolder";
import { useModal } from "components/Modal";
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { FaFolder } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";

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

    const handleDownload = async () => {
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
        // Make a request to download the file with responseType 'blob'
        Api.get(`/folder/download/${folder.uid}`)
            .then(async (res) => {
                const zip = new JSZip();

                // Iterate through the files and add them to the ZIP
                for (const file of res.data.files) {
                    const fileData = atob(file.data);
                    if (file.encryption_status === EncryptionStatus.Encrypted) {
                        const decryptionResult = await decryptMetadata(
                            file.name,
                            file.mime_type,
                            file.cid_original_encrypted,
                            personalSignature
                        );
                        if (!decryptionResult) {
                            logoutUser();
                            return;
                        }
                        const {
                            decryptedFilename,
                            decryptedFiletype,
                            decryptedCidOriginal,
                        } = decryptionResult;
                        const stringToArrayBuffer = (
                            str: string
                        ): ArrayBuffer => {
                            const buf = new ArrayBuffer(str.length);
                            const bufView = new Uint8Array(buf);
                            for (let i = 0; i < str.length; i++) {
                                bufView[i] = str.charCodeAt(i);
                            }
                            return buf;
                        };

                        //transform fileData string to Array Buffer
                        const fileDataBufferEncrypted = stringToArrayBuffer(
                            fileData
                        );
                        const fileDataBuffer = await decryptFileBuffer(
                            fileDataBufferEncrypted,
                            decryptedCidOriginal,
                            () => void 0
                        );
                        if (!fileDataBuffer) {
                            toast.error("Failed to decrypt file");
                            return;
                        }
                        //transform buffer to Blob
                        const fileDataBlob = new Blob([fileDataBuffer], {
                            type: decryptedFiletype,
                        });

                        const decryptedPathComponents = [];
                        const pathComponents = file.path.split("/");
                        // Decrypt the path components
                        for (let i = 0; i < pathComponents.length - 1; i++) {
                            const component = pathComponents[i];
                            const encryptedComponentUint8Array = hexToBuffer(
                                component
                            );

                            const decryptedComponentBuffer = await decryptContent(
                                encryptedComponentUint8Array,
                                personalSignature
                            );
                            const decryptedComponentStr = new TextDecoder().decode(
                                decryptedComponentBuffer
                            );
                            decryptedPathComponents.push(decryptedComponentStr);
                        }
                        decryptedPathComponents.push(decryptedFilename);

                        const decryptedFilePath = decryptedPathComponents.join(
                            "/"
                        );
                        zip.file(decryptedFilePath, fileDataBlob, {
                            binary: true,
                        });
                    } else {
                        zip.file(file.path, fileData, { binary: true });
                    }
                }

                //Generate the ZIP file and trigger the download
                zip.generateAsync({ type: "blob" }).then((content) => {
                    const url = window.URL.createObjectURL(content);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${folder.title}.zip`; // Set the file name
                    a.click(); // Trigger the download
                    // Clean up
                    window.URL.revokeObjectURL(url);
                });
            })
            .catch((err) => {
                console.error("Error downloading folder:", err);
                toast.error("Error downloading folder");
            });
    };

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
