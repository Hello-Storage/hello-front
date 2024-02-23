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

import React from "react";
import { DeleteFolderModal } from "components/Modals/DeleteItem/DeleteFolder";
import { useModal } from "components/Modal";
import { Theme } from "state/user/reducer";
import { GoAlertFill } from "react-icons/go";
import { folderDownload } from "utils/upload/foldersDownload";

interface FolderItemProps {
	actionsAllowed: boolean;
	folder: Folder;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, actionsAllowed }) => {
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
		//downloadFolderMultipart(folder, dispatch, personalSignature);

		folderDownload(personalSignature, folder, dispatch).catch((err) => {
			console.error(err);
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
	return (
		<>
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
						{actionsAllowed && (<>
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
						</>)}
					</div>
				</div>
			</div>
		</>
	);
};

export default FolderItem;