import { Api } from "api";
import { EncryptionStatus, File as FileType } from "api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
	HiDocumentDuplicate,
	HiDotsVertical,
	HiOutlineDownload,
	HiOutlineShare,
	HiOutlineEye,
	HiOutlineTrash, HiOutlineLockOpen,
	HiLockClosed
} from "react-icons/hi";
import { getFileExtension, getFileIcon, viewableExtensions } from "./utils";
import { formatBytes, formatUID } from "utils";
import { toast } from "react-toastify";
import { useDropdown } from "hooks";
import { useRef, useState, Fragment } from "react";
import copy from "copy-to-clipboard";
import { GoAlertFill } from "react-icons/go";
import {
	blobToArrayBuffer,
	decryptFileBuffer,
} from "utils/encryption/filesCipher";
import { useAppDispatch, useAppSelector } from "state";
import {
	removeSharedFileAction,
	setFileViewAction,
	setImageViewAction,
	setSelectedShareFile,
	setShowShareModal,
	removeFileAction
} from "state/mystorage/actions";
import { truncate, formatDate } from "utils/format";
import { AxiosProgressEvent } from "axios";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { Theme } from "state/user/reducer";
import { downloadMultipart, triggerDownload, viewMultipart } from "utils/filesDownload";
const MULTIPART_THRESHOLD = import.meta.env.VITE_MULTIPART_THRESHOLD || 1073741824; // 1GiB or 10000 bytes

dayjs.extend(relativeTime);

interface FileItemProps {
	contentIsShared?: boolean;
	actionsAllowed: boolean;
	file: FileType;
	view: "list" | "grid";
}

const FileItem: React.FC<FileItemProps> = ({ contentIsShared = false, file, view, actionsAllowed }) => {
	const dispatch = useAppDispatch();
	const ref = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const fileExtension = getFileExtension(file.name)?.toLowerCase() || "";
	useDropdown(ref, open, setOpen);

	const onCopy = (event: React.MouseEvent) => {
		if (event.shiftKey) return;
		copy(`${file.cid}`);
		toast.success("copied CID");
	};

	const viewRef = useRef(false);

	const onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
		dispatch(
			setUploadStatusAction({
				info:
					`${viewRef.current ? "Loading" : "Downloading"} ` +
					file.name,
				uploading: true,
			})
		);

		dispatch(
			setUploadStatusAction({
				read: progressEvent.loaded,
				size: file.size,
			})
		);
	};

	// Function to handle file download
	const handleDownload = async () => {
		viewRef.current = false
		toast.info("Starting download for " + file.name + "...");
		// Make a request to download the file with responseType 'blob'
		if (file.size > MULTIPART_THRESHOLD) {
			const blob = await downloadMultipart(file, dispatch)


			dispatch(
				setUploadStatusAction({
					info: "Finished downloading data",
					uploading: false,
				})
			);
			triggerDownload(blob, file.name);

		} else {
			Api.get(`/file/download/${file.uid}`, {
				responseType: "blob",
				onDownloadProgress: onDownloadProgress,
			})
				.then(async (res) => {
					dispatch(
						setUploadStatusAction({
							info: "Finished downloading data",
							uploading: false,
						})
					);
					// Create a blob from the response data
					let binaryData = res.data;

					if (file.encryption_status === EncryptionStatus.Encrypted) {
						const originalCid = file.cid_original_encrypted;
						binaryData = await blobToArrayBuffer(binaryData).catch((error) => {
							console.error("Error transforming blob to array buffer:", error);
							toast.error("Error transforming blob to array buffer");
						});
						binaryData = await decryptFileBuffer(
							binaryData,
							originalCid,
							(percentage) => {
								dispatch(
									setUploadStatusAction({
										info: "Decrypting...",
										read: percentage,
										size: 100,
										uploading: true,
									})
								);
							}
						).catch((err) => {
							console.error("Error decrypting file buffer:", err);
							toast.error("Error decrypting file buffer");
						});

						dispatch(
							setUploadStatusAction({
								info: "Decryption done",
								uploading: false,
							})
						);
					}
					const blob = new Blob([binaryData], { type: file.mime_type });

					// Create a link element and set the blob as its href
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = file.name; // Set the file name
					a.click(); // Trigger the download
					toast.success("Download complete!");

					// Clean up
					window.URL.revokeObjectURL(url);
				})
				.catch((err) => {
					console.error("Error downloading file:", err);
				});
		}
	};

	const handleView = () => {
		viewRef.current = true;

		if (file.size > MULTIPART_THRESHOLD) {
			viewMultipart(file, dispatch)
		} else {
			toast.info("Loading " + file.name + "...");
			dispatch(setFileViewAction({ file: undefined }));
			dispatch(setImageViewAction({ show: false }));

			dispatch(
				setFileViewAction({
					file: file,
				})
			);
			dispatch(
				setImageViewAction({
					show: true,
				})
			);
		}
	};

	const handleDelete = () => {
		toast.info("Deleting file...");
		// Make a request to delete the file with response code 200
		Api.delete(`/file/delete/${file.uid}`)
			.then(() => {
				toast.success("File deleted!");
				if (contentIsShared) {
					dispatch(removeSharedFileAction(file.uid));
				} else {
					dispatch(removeFileAction(file.uid));
				}
			})
			.catch((err) => {
				console.error("Error deleting file:", err);

				toast.error("Error deleting file");
			});
	};

	const { theme } = useAppSelector((state) => state.user);

	if (view === "list")
		return (
			<>
				<td
					onDoubleClick={viewableExtensions.has(fileExtension) ? handleView : undefined}
					scope="row"
					className={"px-3 font-medium whitespace-nowrap "
						+ (theme === Theme.DARK ? " text-white" : " text-gray-900")}
				>
					<div className="flex items-center gap-3 ">
						{getFileIcon(file, theme)}
						{file.is_in_pool && (
							<GoAlertFill
								style={{ color: "#FF6600" }}
								title="File is in Hello Pool"
							/>
						)}
						<span className="hidden md:inline content-text">
							{truncate(file.name, 40)}
						</span>
						<span className="inline md:hidden content-text">
							{truncate(file.name, 24)}
						</span>
					</div>
				</td>
				<td className="py-1 pr-8">
					<button
						className="flex items-center gap-1 select-none hover:text-blue-500"
						onClick={onCopy}
					>
						{formatUID(file.cid)}
						<HiDocumentDuplicate />
					</button>
				</td>
				<td className="py-1 pr-8 whitespace-nowrap">
					{formatBytes(file.size)}
				</td>
				<td className="py-1 pr-8">
					<div className="flex items-center">
						{file.encryption_status === "public" ? (
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
					{dayjs(formatDate(file.created_at)).fromNow()}
				</td>
				<td className="py-1 pr-8 text-right">
					<button
						className={"p-3 rounded-full "
							+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
						onClick={() => setOpen(!open)}
					>
						<HiDotsVertical />
						<div className="relative " ref={ref}>
							{open && (
								<div
									id="dropdown"
									className="absolute top-0 z-50 mt-2 text-left border divide-y shadow-lg right-6 w-36 "
									style={{ bottom: "100%" }}
								>
									<ul className={(theme === Theme.DARK ? " bg-[#0f103d]" : " bg-white")}
									>
										<li
											className={"block px-4 py-2 "
												+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
											onClick={handleDownload}
										>
											<HiOutlineDownload className="inline-flex mr-3" />
											Download
										</li>
										{(actionsAllowed) && (<>
											<li
												onClick={() => {
													dispatch(
														setShowShareModal(true)
													);
													dispatch(
														setSelectedShareFile(file)
													);
												}}
												className={"block px-4 py-2 "
													+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
											>
												<HiOutlineShare className="inline-flex mr-3" />
												Share
											</li>
										</>)}

										{viewableExtensions.has(
											fileExtension
										) && (
												<li
													className={"block px-4 py-2 "
														+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
													onClick={() => handleView()}
												>
													<HiOutlineEye className="inline-flex mr-3" />
													View
												</li>
											)}
									</ul>

									<div className={(theme === Theme.DARK ? " bg-[#0f103d]" : " bg-white")}
									>
										{actionsAllowed && (<>
											<p
												className={"block px-4 py-3 "
													+ (theme === Theme.DARK ? " hover:bg-[#32334b]" : " hover:bg-gray-200")}
												onClick={handleDelete}
											>
												<HiOutlineTrash className="inline-flex mr-3" />
												Delete
											</p>
										</>)}
									</div>
								</div>
							)}
						</div>
					</button>
				</td>
			</>
		);
	else
		return (
			<div
				onDoubleClick={handleView}
			>
				<div>
					<div className="flex flex-col items-center gap-3">
						<div className={"flex items-center w-full gap-2 overflow-hidden font-medium text-center whitespace-nowrap overflow-ellipsis"
							+ (theme === Theme.DARK ? " text-white" : "  text-gray-900")}
						>
							{getFileIcon(file, theme)}
							{file.is_in_pool && (
								<GoAlertFill style={{ color: "#FF6600" }} />
							)}
							<span className="hidden md:inline content-text">
								{truncate(file.name, 40)}
							</span>
							<span className="inline md:hidden">
								{truncate(file.name, 24)}
							</span>
						</div>
					</div>
				</div>
				<div
					className="flex items-center gap-1 mt-4 text-xs text-center select-none justify-left hover:text-blue-500"
					onClick={(e) => {
						e.stopPropagation(); // Prevent triggering the parent's onClick
						onCopy(e);
					}}
				>
					<label>{formatUID(file.cid)}</label>
					<HiDocumentDuplicate className="inline-block" />
				</div>
			</div>
		);
};

export default FileItem;
