/* eslint-disable react-hooks/exhaustive-deps */
import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { useAuth, useDropdown, useFetchData } from "hooks";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { HiPlus } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "state";
import { Api, EncryptionStatus, File as FileType } from "api";
import { toast } from "react-toastify";
import { PiShareFatFill } from "react-icons/pi";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { getCid } from "utils/encryption/filesCipher";
import {
	createFileAction,
	createFolderAction,
	setSelectedSharedFiles,
} from "state/mystorage/actions";
import { AxiosProgressEvent, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { shareFile, unshareFile } from "../Utils/shareUtils";
import { shareDetails } from "./shareDetails";
import { useShareGroup } from "../Utils/useShareGroup";
import { Spinner5 } from "components/Spinner";
import { FaPlusCircle } from "react-icons/fa";
import { isValidEmail } from "utils/validations";
import { Theme } from "state/user/reducer";
import { ListUserElement } from "./UserListElement";

interface UploadShareModalProps {
	isOpen: boolean;
	setIsopen: React.Dispatch<React.SetStateAction<boolean>>;
}

const UploadShareModal: React.FC<UploadShareModalProps> = ({
	isOpen,
	setIsopen,
}) => {
	const [fileSharedState, setFileSharedState] = useState<ShareState[]>([]);
	const [uploaded, setuploaded] = useState<boolean>(false);
	const { encryptionEnabled, autoEncryptionEnabled } = useAppSelector(
		(state) => state.userdetail
	);
	const [Procesing, setProcesing] = useState(false);
	const { fetchUserDetail } = useFetchData();
	const { name } = useAppSelector((state) => state.user);
	const accountType = getAccountType();

	const { logout } = useAuth();

	const dropRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	useDropdown(dropRef, open, setOpen);
	const fileInput = useRef<HTMLInputElement>(null);
	const dispatch = useAppDispatch();
	const [pinnedDescriptionIndex, setPinnedDescriptionIndex] = useState<
		number | null
	>(null);

	const [user, setuser] = useState<string>("");
	const [userList, setuserList] = useState<User[]>([]);
	const [readyToshare, setreadyToshare] = useState<boolean>(false);
	const { fetchSharedContent } = useFetchData();
	const modalRef = useRef<HTMLDivElement>(null);

	const navigate = useNavigate();
	const [shareError, setShareError] = useState("");
	const [selectedShareTypes, setSelectedShareTypes] = useState<string>("");
	const { selectedSharedFiles } = useAppSelector((state) => state.mystorage);

	const handleShareChange = (type: string) => async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const shareTypeObject = shareDetails.find((st) => st.type === type);
		setShareError("");
		if (selectedSharedFiles) {
			if (!shareTypeObject) {
				setShareError("Invalid share type");
			} else if (shareTypeObject.state === "disabled") {
				setShareError("This share type is not available yet");
			} else if (["wallet", "email"].includes(type)) {
				setSelectedShareTypes(type);
			} else {
				setSelectedShareTypes(type);
				for (const selectedShareFile of selectedSharedFiles) {
					if (e.target.checked) {
						// Handle sharing from shareRequests.ts
						shareFile(selectedShareFile, type, user)
							.then((res) => {
								res = res as AxiosResponse;
								if (res.status === 200) {
									const shareState = res.data as ShareState;
									setFileSharedState((prevStates) => {
										// Update the specific share state without replacing the entire array
										const updatedStates = prevStates.map(
											(state) =>
												state.id === shareState.id
													? shareState
													: state
										);
										return updatedStates;
									});
									toast.success("File shared successfully");
								}
							})
							.catch((err) => {
								setShareError(err.message);
							});
					} else {
						setSelectedShareTypes("");
						unshareFile(selectedShareFile, type)
							.then((res) => {
								res = res as AxiosResponse;
								if (res.status === 200) {
									toast.info("Successfully unshared");
								}
							})
							.catch((err) => {
								setShareError(err.message);
							});
					}
				}
			}
		}
		setuserList([]);
	};

	const closeShareModal = () => {
		setProcesing(false);
		setIsopen(false);
		fetchSharedContent();
	};

	const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
		dispatch(
			setUploadStatusAction({
				read: progressEvent.loaded,
				size: progressEvent.total,
			})
		);
	};

	const handleInputChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
		isFolder: boolean
	) => {
		setProcesing(true);
		toast.info("Uploading...");
		const root = "/";
		const files = event.target.files;

		if (!files) return;
		let outermostFolderTitle = "";

		if (isFolder && files.length > 0 && files[0].webkitRelativePath) {
			outermostFolderTitle = files[0].webkitRelativePath.split("/")[0];
		}

		const formData = new FormData();
		formData.append("root", root);

		let personalSignature;
		if (encryptionEnabled) {
			personalSignature = await getPersonalSignature(
				name,
				autoEncryptionEnabled,
				accountType,
				logout
			);
			if (!personalSignature) {
				toast.error("Failed to get personal signature");
				logout();
				return;
			}
		}

		let encryptionTimeTotal = 0;

		const filesMap: { customFile: FileType; file: File }[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const uint8ArrayBuffer = new Uint8Array(await file.arrayBuffer());
			const cidStr = await getCid(uint8ArrayBuffer);

			const customFile: FileType = {
				name: file.name,
				cid: cidStr,
				id: 0,
				uid: "",
				cid_original_encrypted: "",
				size: file.size,
				root: root,
				mime_type: file.type,
				media_type: file.type.split("/")[0],
				path: file.webkitRelativePath,
				encryption_status: EncryptionStatus.Public,
				created_at: "",
				updated_at: "",
				deleted_at: "",
			};

			filesMap.push({ customFile, file });
		}

		//parse encryption total of all files with encrypted option
		if (encryptionTimeTotal > 0) {
			let encryptionSuffix = "milliseconds";
			if (encryptionTimeTotal >= 1000 && encryptionTimeTotal < 60000) {
				encryptionTimeTotal /= 1000;
				encryptionSuffix = "seconds";
			} else if (encryptionTimeTotal >= 60000) {
				encryptionTimeTotal /= 60000;
				encryptionSuffix = "minutes";
			}
			const encryptionTimeParsed =
				"Encrypting the data took " +
				encryptionTimeTotal.toFixed(2).toString() +
				" " +
				encryptionSuffix;
			toast.success(`${encryptionTimeParsed}`);
		}

		const infoText = isFolder
			? `uploading ${files[0].webkitRelativePath.split("/")[0]} folder`
			: files.length === 1
				? files[0].name
				: `uploading ${files.length} files`;

		dispatch(setUploadStatusAction({ info: infoText, uploading: true }));

		postData(formData, filesMap, outermostFolderTitle, isFolder);
	};

	const postData = async (
		formData: FormData,
		filesMap: { customFile: FileType; file: File }[],
		outermostFolderTitle: string,
		isFolder: boolean
	) => {
		//iterate over each file and make a get request to check if cid exists in Api
		//post file metadata to api
		const filesuploaded: FileType[] = [];

		//get customFiles from filesMap
		const customFiles = filesMap.map((fileMap) => fileMap.customFile);
		let filesToUpload: { customFile: FileType; file: File }[] = [];

		let folderRootUID = "";
		await Api.post(`/file/pool/check`, customFiles)

			.then((res) => {
				// CIDs of files that were FOUND in S3 and need to be dispatched.
				const filesFound: FileType[] = res.data.filesFound;
				folderRootUID = res.data.firstRootUID;

				// Dispatch actions for files that were found in S3.
				filesToUpload = filesMap.filter((fileMap) => {
					const fileInFilesFound = (filesFound || []).some(
						(fileFound) => fileFound.cid === fileMap.customFile.cid
					);
					return !fileInFilesFound;
				});

				filesToUpload.forEach((fileMap, index) => {
					// Append the files that need to be uploaded to formData.
					if (
						fileMap.customFile.encryption_status ===
						EncryptionStatus.Encrypted
					) {
						formData.append("encryptedFiles", fileMap.file);
						formData.append(
							`cid[${index}]`,
							fileMap.customFile.cid
						);
						if (
							fileMap.customFile.cid_original_encrypted_base64_url
						)
							formData.append(
								`cidOriginalEncrypted[${index}]`,
								fileMap.customFile
									.cid_original_encrypted_base64_url
							);
						formData.append(
							`webkitRelativePath[${index}]`,
							fileMap.customFile.path
						);
					} else {
						formData.append(
							`cid[${index}]`,
							fileMap.customFile.cid
						);
						formData.append("files", fileMap.file);
					}
				});

				const filesFoundInS3 = filesMap.filter((fileMap) =>
					(filesFound || []).some(
						(fileFound) => fileFound.cid === fileMap.customFile.cid
					)
				);

				filesFoundInS3.forEach((fileMap) => {
					if (filesFound) {
						const fileFound = filesFound.find(
							(f) => f.cid === fileMap.customFile.cid
						);

						//replace for customFile in fileMap values:
						//- put name_unencrypted to name
						//- put cid_original_unencrypted to cid_original_encrypted
						//- put mime_type_unencrypted to mime_type

						fileMap.customFile.id = fileFound?.id || 0;
						fileMap.customFile.uid = fileFound?.uid || "";
						fileMap.customFile.created_at = fileFound
							? fileFound.created_at.toString()
							: "";
						fileMap.customFile.updated_at = fileFound
							? fileFound.updated_at.toString()
							: "";
						fileMap.customFile.is_in_pool =
							fileFound?.is_in_pool || false;

						fileMap.customFile.name = fileFound?.name_unencrypted || fileFound?.name || "";
						fileMap.customFile.cid_original_encrypted =
							fileFound?.cid_original_unencrypted || "";
						fileMap.customFile.mime_type =
							fileFound?.mime_type_unencrypted || fileFound?.mime || "";

						if (!isFolder) filesuploaded.push(fileMap.customFile);
						dispatch(createFileAction(fileMap.customFile));
					}
				});
			})
			.catch((err) => {
				console.log(err);
			});

		if (filesToUpload.length !== 0) {
			await Api.post("/file/upload", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress,
			})
				.then((res) => {
					if (res.status !== 200) {
						toast.error("upload failed!");
						return;
					}
					toast.success("upload Succeed!");
					dispatch(
						setUploadStatusAction({
							info: "Finished uploading data",
							uploading: false,
						})
					);

					//getAll files and encryptedFils into a single files variable from formData
					const filesRes = res.data.files;

					for (let i = 0; i < filesRes.length; i++) {
						//get file at index from formdata
						const fileRes = filesRes[i];
						const file = customFiles[i];

						const fileObject: FileType = {
							name: file.name_unencrypted || file.name,
							cid: fileRes.cid,
							id: fileRes.id,
							uid: fileRes.uid,
							cid_original_encrypted:
								file.cid_original_unencrypted ||
								file.cid_original_encrypted,
							size: file.size,
							root: fileRes.root,
							mime_type:
								file.mime_type_unencrypted || file.mime_type,
							media_type: file.media_type,
							path: file.path,
							encryption_status: fileRes.encryption_status,
							created_at: fileRes.created_at,
							updated_at: fileRes.updated_at,
							deleted_at: fileRes.deleted_at,
						};
						filesuploaded.push(fileObject);
						if (!isFolder) dispatch(createFileAction(fileObject));
					}
				})
				.catch(() => {
					toast.error("upload failed!");
				})
				.finally(() => {
					dispatch(setUploadStatusAction({ uploading: false }));
				});
		} else {
			toast.success("upload Succeed!");
			dispatch(
				setUploadStatusAction({
					info: "Finished uploading data",
					uploading: false,
				})
			);
		}
		dispatch(setSelectedSharedFiles(filesuploaded));
		if (isFolder && folderRootUID !== "" && outermostFolderTitle !== "") {
			dispatch(
				createFolderAction({
					title: outermostFolderTitle,
					uid: folderRootUID,
					root: "/",
					created_at: "",
					updated_at: "",
					deleted_at: "",
					id: 0,
					path: "/",
					encryption_status: encryptionEnabled
						? EncryptionStatus.Encrypted
						: EncryptionStatus.Public,
				})
			);
		}
		fetchUserDetail();
		dispatch(setUploadStatusAction({ uploading: false }));
	};

	const handleClickOutside = (
		event: React.MouseEvent<HTMLDivElement, MouseEvent>
	) => {
		setProcesing(false);
		if (
			modalRef.current &&
			!modalRef.current.contains(event.target as Node)
		) {
			closeShareModal();
		}
	};

	const handleFileUpload = () => {
		fileInput.current?.click();
	};

	const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
		event
	) => {
		handleInputChange(event, false);
	};

	useEffect(() => {
		dispatch(setSelectedSharedFiles());
		setProcesing(false);
		setreadyToshare(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (selectedSharedFiles) {
			setuploaded(true);
			setProcesing(false);
		} else {
			setuploaded(false);
		}
	}, [selectedSharedFiles]);

	useEffect(() => {
		if (
			selectedSharedFiles &&
			selectedSharedFiles.length > 0
		) {
			const uids = selectedSharedFiles.map((file) => file.uid);
			const params = new URLSearchParams();
			uids.forEach((uid) => params.append("file_uids", uid));
			Api.get("/file/share/states", { params })
				.then((res) => {
					if ((res as AxiosResponse).status === 200) {
						res = res as AxiosResponse;
						const shareState = res?.data as ShareState[];
						if (shareState) {
							setFileSharedState(shareState);
						}
					} else {
						toast.error(JSON.stringify(res));
					}
				})
				.catch((err) => {
					toast.error(err.message);
				});
		}
	}, [selectedSharedFiles]);

	const handleAddEmail = () => {
		if (selectedShareTypes === "email" && !isValidEmail(user)) {
			if (userList.length === 0) {
				toast.error("Invalid Email.");
				return false;
			}
		}
		if (userList.length >= 5) {
			toast.error("Max number of users reached");
			return false;
		}
		if (!user) {
			return false;
		}

		if (!userList.map((u) => u.email).includes(user)) {
			const newUser = { email: user, color: "#878787" };
			setuserList([...userList, newUser]);
			setuser("");
			return true;
		} else {
			toast.error("Email already in the list.");
			return false;
		}
	};

	const handleSubmit = () => {
		const res = handleAddEmail();
		if (res || userList.length > 0) {
			setreadyToshare(true);
			toast.info("Sharing in progress");
		}
		if (!res && userList.length === 0) {
			toast.error("No users specified");
		}
	};

	const handleRemoveEmail = (index: number) => {
		const updatedEmailList = [...userList];
		updatedEmailList.splice(index, 1);
		setuserList(updatedEmailList);
	};

	useEffect(() => {
		if (readyToshare) {
			if (userList.length > 0 && selectedSharedFiles) {
				for (const user of userList) {
					for (const selectedShareFile of selectedSharedFiles) {
						shareFile(
							selectedShareFile,
							selectedShareTypes,
							user.email
						)
							.then((res) => {
								res = res as AxiosResponse;
								if (res.status === 200) {
									toast.success("File shared successfully");
								}
							})
							.catch((err) => {
								setShareError(err.message);
							});
					}
				}
			}
			setreadyToshare(false);
			closeShareModal();
		}
	}, [readyToshare]);

	const groupID = useShareGroup(fileSharedState, selectedShareTypes);

	const { theme } = useAppSelector((state) => state.user);

	if (!isOpen) {
		return <></>;
	} else {
		return (
			<div
				className="fixed inset-0 z-10"
				aria-labelledby="modal-title"
				role="dialog"
				aria-modal="true"
			>
				<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 my-3 text-center sm:p-0">
					<input
						ref={fileInput}
						type="file"
						id="file"
						onChange={handleFileInputChange}
						multiple={true}
						accept="*/*"
						hidden
					/>
					<div
						onClick={handleClickOutside}
						className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
						aria-hidden="true"
					></div>

					<span
						className="hidden sm:inline-block sm:align-middle sm:h-screen"
						aria-hidden="true"
					>
						&#8203;
					</span>

					<section
						ref={modalRef}
						className={"lg:ml-[20%] p-5 flex flex-col justify-center align-center align-bottom top-5 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg "
							+ (theme === Theme.DARK ? " dark-theme4" : " bg-white")}
					>
						<div className="flex flex-col items-center justify-center w-full h-full min-w-[300px]">
							{shareError && (
								<div
									className="alert alert-danger"
									role="alert"
								>
									{shareError}
								</div>
							)}
							{uploaded ? (
								<>
									<p className="px-2 my-3">File names:</p>
									<ul>
										{selectedSharedFiles &&
											selectedSharedFiles.map(
												(file) => {
													return (
														<li key={file.id}>
															{file.name}
														</li>
													);
												}
											)}
									</ul>
									{selectedShareTypes !== "" && (
										<>
											{groupID &&
												[
													"public",
													"one-time",
													"monthly",
												].includes(
													selectedShareTypes
												) ? (
												<div className="flex flex-col my-3">
													<label
														htmlFor="shareLink"
														className="form-label"
													>
														Share link
													</label>
													<div className="">
														<input
															type="text"
															className={"mb-2 underline form-control py-1 px-2 border rounded-lg text-cyan-600 text-ellipsis "
																+ (theme === Theme.DARK ? " dark-theme3" : " ")}
															id="shareLink"
															aria-describedby="shareLink"
															value={`${window.location.origin}/space/shared/group/${groupID}`}
															onClick={() => {
																//copy to clipboard
																navigator.clipboard.writeText(
																	`${window.location.origin}/space/shared/group/${groupID}`
																);
																toast.success(
																	"Link copied to clipboard"
																);
															}}
															readOnly
														/>
														<button
															className="ml-2 btn btn-primary"
															onClick={() =>
																navigate(
																	`/space/shared/group/${groupID}`
																)
															}
														>
															<i className="fas fa-external-link-alt"></i>{" "}
															Go
														</button>
													</div>
												</div>
											) : (
												[
													"email",
													"wallet",
												].includes(
													selectedShareTypes
												) &&
												<form
													className="flex flex-col items-center w-full my-3"
													onSubmit={(e) => {
														e.preventDefault();
													}}
												>
													<label
														htmlFor="user"
														className="block mb-2 text-sm font-medium text-gray-600"
													>
														{selectedShareTypes ===
															"email"
															? "Email address"
															: "Wallet address"}
													</label>
													<div className="flex flex-row flex-wrap w-full usr-l-fade mb-2">
														{userList.map(
															(
																user,
																index
															) =>
																<ListUserElement
																	user={user}
																	handleRemoveEmail={handleRemoveEmail}
																	index={index}
																	key={user.email}
																></ListUserElement>
														)}
													</div>
													<div className="flex flex-row items-center justify-center">
														<input
															id="user"
															type="email"
															className={" border border-gray-200 text-sm rounded-xl focus:border-blue-400 focus:outline-none block w-full px-2.5 py-2"
																+ (theme === Theme.DARK ? " dark-theme3" : " text-gray-900 bg-gray-50")}
															placeholder={
																selectedShareTypes ===
																	"email"
																	? "example@email.com"
																	: "0x00000EXAMPLE..."
															}
															value={user}
															onChange={(
																e
															) => {
																setuser(
																	e.target
																		.value
																);
															}}
														/>
														<button
															className="h-full w-[38px] transition-transform transform hover:scale-110 flex items-center justify-center"
															type="button"
															onClick={
																handleAddEmail
															}
														>
															<FaPlusCircle
																size={35}
																color={(theme === Theme.DARK ? "#ffffff" : "#272727")}
															/>
														</button>
													</div>
													<button
														className="p-3 mt-3 animated-bg-btn rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
														type="submit"
														onClick={
															handleSubmit
														}
													>
														<span className="btn-transition"></span>
														<label className="flex items-center justify-center w-full gap-2 text-sm text-white">
															<PiShareFatFill />{" "}
															Accept
														</label>
													</button>
												</form>
											)}
										</>
									)}
									{shareDetails.map((sd, index) => {
										return (
											<div
												key={sd.id}
												className="my-3 col-12 form-check form-switch"
											>
												<label
													className="form-check-label"
													htmlFor={`flexSwitch${sd.type}`}
												>
													<div className="flex flex-col">
														<div className="flex flex-row items-center">
															<input
																type="checkbox"
																className="w-5 h-5 text-blue-600 form-checkbox"
																checked={
																	selectedShareTypes ===
																	sd.type
																}
																onChange={handleShareChange(
																	sd.type
																)}
																disabled={
																	sd.state ===
																	"disabled"
																}
															/>
															<span className={"ml-2 "
																+ (theme === Theme.DARK ? " text-white" : " text-gray-700")}>
																{sd.title}
															</span>
															<span
																className="ml-2 text-gray-500 cursor-pointer"
																onClick={() => {
																	if (
																		pinnedDescriptionIndex ===
																		index
																	) {
																		setPinnedDescriptionIndex(
																			null
																		);
																	} else {
																		setPinnedDescriptionIndex(
																			index
																		);
																	}
																}}
															>
																<i
																	className={`fas fa-thin fa-question-circle p-2 me-2`}
																></i>
															</span>
														</div>

														{pinnedDescriptionIndex ===
															index && (
																<span
																	id="description"
																	className={"flex p-2 ml-2 text-sm rounded "
																		+ (theme === Theme.DARK ? " bg-[#32334b]" : " bg-gray-200")}
																>
																	{
																		sd.description
																	}
																</span>
															)}
													</div>
												</label>
											</div>
										);
									})}
								</>
							) : (
								<>
									<p className="px-2 my-3">
										Choose the Files you want to share
									</p>
									{Procesing ? (
										<div className="w-full h-3 m-6">
											<Spinner5></Spinner5>
										</div>
									) : (
										<></>
									)}
									<button
										className="p-3 my-3 animated-bg-btn rounded-xl bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
										onClick={handleFileUpload}
									>
										<span className="btn-transition"></span>
										<label className="flex items-center justify-center w-full gap-2 text-sm text-white">
											<HiPlus /> Upload files
										</label>
									</button>
								</>
							)}

							<button
								type="button"
								className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
									+ (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
								onClick={closeShareModal}
							>
								Close
							</button>
						</div>
					</section>
				</div>
			</div>
		);
	}
};

export default UploadShareModal;
