import { Api } from "api";
import { EncryptionStatus, Folder } from "api/types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth, useDropdown } from "hooks";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";
import { FaFolder } from "react-icons/fa";
import {
	HiDotsVertical,
	HiOutlineDownload,
	HiOutlineShare,
	HiOutlineTrash,
} from "react-icons/hi";
// import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import {
	decryptContent,
	decryptFileBuffer,
	decryptMetadata,
	hexToBuffer,
} from "utils/encryption/filesCipher";
import getPersonalSignature from "api/getPersonalSignature";
import { useAppDispatch, useAppSelector } from "state";
import getAccountType from "api/getAccountType";
import { logoutUser } from "state/user/actions";
import { truncate } from "utils/format";
import { removeFolder } from "state/mystorage/actions";

dayjs.extend(relativeTime);

import React from "react";
import { DeleteFolderModal } from "components/Modals/DeleteItem/DeleteFolder";
import { useModal } from "components/Modal";

interface FolderItemProps {
	folder: Folder;
	view: "list" | "grid";
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, view }) => {
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

	// const onCopy = (event: React.MouseEvent) => {
	//   if (!event.ctrlKey) return;
	//   copy(`https://hello.app/space/folder/${folder.uid}`);
	//   toast.success("copied CID");
	// };

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

	if (view === "list")
		return (
			<>
				<div className="bg-gray-50 hover:bg-gray-100 px-5 py-3 w-[220px] rounded-lg relative overflow-visible">
					<div className="relative flex flex-row items-center justify-between">
						<FaFolder
							className="inline-block mr-2 align-middle"
							size={24}
							color="#272727"
						/>
						<div className="relative flex flex-row items-center justify-between w-full">
							<label className="w-full overflow-hidden font-medium text-gray-900 cursor-pointer whitespace-nowrap overflow-ellipsis">
								{truncate(folder.title, 12)}
							</label>
							<button
								className="p-1 rounded-lg hover:bg-gray-100"
								onClick={() => setOpen(!open)}
							>
								<HiDotsVertical className="align-middle" />{" "}
								<div className="drop-down-menu" ref={ref}>
									{open && (
										<div
											id="dropdown"
											className="absolute right-0 z-50 mt-2 text-left origin-top-right bg-white divide-y shadow w-36 borde r"
										>
											<ul className="py-2">
												<a
													href="#"
													className="block px-4 py-2 hover:bg-gray-100"
													onClick={handleDownload}
												>
													<HiOutlineDownload className="inline-flex mr-3" />
													Download
												</a>
												{/*
                        <a
                          href="#"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          <HiOutlineShare className="inline-flex mr-3" />
                          Share
                  </a>*/}
											</ul>
											<div className="py-2">
												<a
													href="#"
													className="block px-4 py-2 hover:bg-gray-100"
													onClick={onPresent}
												>
													<HiOutlineTrash className="inline-flex mr-3" />
													Delete
												</a>
											</div>
										</div>
									)}
								</div>
							</button>
						</div>
					</div>
				</div>
			</>
		);
	else
		return (
			<div className="bg-gray-50 hover:bg-gray-100 px-5 py-3 w-[220px] rounded-lg relative">
				<div className="flex flex-row items-center justify-between">
					<FaFolder
						className="inline-block mr-2 align-middle"
						size={24}
						color="#272727"
					/>
					<div className="flex flex-row items-center justify-between w-full">
						<label className="w-full overflow-hidden font-medium text-gray-900 cursor-pointer whitespace-nowrap overflow-ellipsis">
							{truncate(folder.title, 12)}
						</label>
						<button
							className="p-1 rounded-lg hover:bg-gray-100"
							onClick={() => setOpen(!open)}
						>
							<HiDotsVertical className="align-middle" />{" "}
							<div className="relative" ref={ref}>
								{open && (
									<div
										id="dropdown"
										className="absolute z-10 mt-2 text-left bg-white border divide-y shadow right-6 w-36"
									>
										<ul className="py-2">
											<a
												href="#"
												className="block px-4 py-2 hover:bg-gray-100"
												onClick={handleDownload}
											>
												<HiOutlineDownload className="inline-flex mr-3" />
												Download
											</a>
											<a
												href="#"
												className="block px-4 py-2 hover:bg-gray-100"
											>
												<HiOutlineShare className="inline-flex mr-3" />
												Share
											</a>
										</ul>
										<div className="py-2">
											<a
												href="#"
												className="block px-4 py-2 hover:bg-gray-100"
												onClick={handleDelete}
											>
												<HiOutlineTrash className="inline-flex mr-3" />
												Delete
											</a>
										</div>
									</div>
								)}
							</div>
						</button>
					</div>
				</div>
			</div>
		);
};

export default FolderItem;
