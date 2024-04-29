import { Api } from "api";
import { Folder } from "api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth, useDropdown } from "hooks";
import { useEffect, useRef, useState } from "react";
import { FaFolder } from "react-icons/fa";
import {
	HiDotsVertical,
	HiOutlineDownload,
	HiOutlineShare,
	HiOutlineTrash,
} from "react-icons/hi";
import { toast } from "react-toastify";
import getPersonalSignature from "api/getPersonalSignature";
import { useAppDispatch, useAppSelector } from "state";
import getAccountType from "api/getAccountType";
import { truncate } from "utils/format";
import { removeFolder, setSelectedShareFile, setSelectedShareFolder, setShowShareModal } from "state/mystorage/actions";

dayjs.extend(relativeTime);

import { DeleteFolderModal } from "components/Modals/DeleteItem/DeleteFolder";
import { useModal } from "components/Modal";
import { Theme } from "state/user/reducer";
import { GoAlertFill } from "react-icons/go";
// import { DowloadFolder } from "./FolderUtils";
import useGetFolderFiles from "pages/Shared/Utils/useGetFolderFiles";
import { FolderContentClass } from "pages/Shared/Utils/types";
import { downloadFolderMultipart, folderDownload } from "utils/foldersDownload";
// import { folderDownload } from "utils/foldersDownload";
// import { DowloadFolder } from "./FolderUtils";
const MULTIPART_THRESHOLD = import.meta.env.VITE_MULTIPART_THRESHOLD || 1073741824;

interface FolderItemProps {
	actionsAllowed: boolean;
	folder: Folder;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, actionsAllowed }) => {
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [deleteAcepted, setDeleteAcepted] = useState(false);
    const { cache } = useAppSelector((state) => state.mystorage);
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
	return (
		<div className=" px-5 py-3 w-[220px] relative overflow-visible border rounded-lg"
		>
			<div className="relative flex flex-row items-center justify-between">
				<FaFolder
					className="inline-block mr-2 align-middle"
					size={24}
					color={(theme === Theme.DARK ? "#ffffff" : "#272727")}
				/>
				<div className="relative flex flex-row items-center justify-between w-full rounded-lg">
					<span className="mr-2" >
						{folder.is_in_pool && (
							<GoAlertFill
								style={{ color: "#FF6600" }}
								title="Folder is in Hello Pool"
							/>
						)}
					</span>
					<label className={"w-full overflow-hidden font-medium cursor-pointer whitespace-nowrap overflow-ellipsis"
						+ (theme === Theme.DARK ? " text-white" : " text-gray-900")}
					>
						{truncate(folder.title, 12)}
					</label>
					{actionsAllowed && (
						<button
							className={"p-1 rounded-lg "
								+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
							onClick={() => setOpen(!open)}
						>
							<HiDotsVertical className="align-middle" />{" "}
							<div className="drop-down-menu" ref={ref}>
								{open && (
									<ul
										id="dropdown"
										className={"absolute right-0 z-[100] mt-2 text-left origin-top-right divide-y shadow w-36 border"
											+ (theme === Theme.DARK ? " dark-theme4" : " bg-white")}
									>
										<li
											className={"block px-4 py-2 "
												+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-100")}
											onClick={handleDownload}
										>
											<HiOutlineDownload className="inline-flex mr-3" />
											Download
										</li>
										{!folder.is_in_pool && (
											<li
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
												className={"block px-4 py-2 "
													+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
											>
												<HiOutlineShare className="inline-flex mr-3" />
												Share
											</li>
										)}
										<li
											className={"block px-4 py-2 "
												+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-100")}
											onClick={onPresent}
										>
											<HiOutlineTrash className="inline-flex mr-3" />
											Delete
										</li>
									</ul>
								)}
							</div>
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default FolderItem;