import getAccountType from "api/getAccountType";
import getPersonalSignature from "api/getPersonalSignature";
import { useAuth, useDropdown, useFetchData } from "hooks";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { HiPlus } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "state";
import { Api, EncryptionStatus, File as FileType } from "api";
import { toast } from "react-toastify";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import {
	bufferToBase64Url,
	bufferToHex,
	encryptBuffer,
	encryptFileBuffer,
	encryptMetadata,
	getCid,
} from "utils/encryption/filesCipher";
import { createFileAction, createFolderAction, setSelectedSharedFiles } from "state/mystorage/actions";
import { AxiosError, AxiosProgressEvent, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { shareFile, unshareFile } from "../Utils/shareUtils";

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
	const { fetchUserDetail } = useFetchData();
	const { name } = useAppSelector((state) => state.user);
	const accountType = getAccountType();

	const { logout } = useAuth();

	const dropRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	useDropdown(dropRef, open, setOpen);

	const closeShareModal = () => {
		setIsopen(false);
	};

	const dispatch = useAppDispatch();

	const [showDescriptionIndex, setShowDescriptionIndex] = useState<
		number | null
	>(null);
	const [pinnedDescriptionIndex, setPinnedDescriptionIndex] = useState<
		number | null
	>(null);

	const modalRef = useRef<HTMLDivElement>(null);

	const shareDetails: ShareDetails[] = [
		{
			type: "public",
			title: "Public",
			description:
				"Generate a public URL that anyone you share it to can access. This URL will be valid until you disable it. Deletion of the file from the entire Internet is not granted.",
			state: "enabled",
		},
		// {
		//     type: "one-time",
		//     title: "One-time only",
		//     description: "Generate an obfuscated URL that can be accessed only once. Once visited, the URL will self-destroy.",
		//     state: "disabled"
		// },
		// {
		//     type: "address-restricted",
		//     title: "Address restricted",
		//     description: "Generate a URL that can be accessed only from a specific wallet address that has to be verified with a provider's signature.",
		//     state: "disabled"
		// },
		// {
		//     type: "password-protected",
		//     title: "Password protected",
		//     description: "Generate a URL that can be accessed only by providing a password. The password' hash will be stored in the blockchain and will be required to access the file.",
		//     state: "disabled"
		// },
		// {
		//     type: "temporary-link",
		//     title: "Temporary link",
		//     description: "Generate a URL that can be accessed only for a limited time. The URL will self-destroy after the time expires.",
		//     state: "disabled"
		// },
		// {
		//     type: "subscription",
		//     title: "Subscription based",
		//     description: "Not implememnted yet. This feature will allow you to generate a URL for the content that can be accessed only by paying a subscription.",
		//     state: "disabled"
		// }
	];

	const navigate = useNavigate();
	const [shareError, setShareError] = useState("");
	const [selectedShareTypes, setSelectedShareTypes] = useState<string[]>([]);
	const { selectedSharedFiles } = useAppSelector((state) => state.mystorage);

	const handleShareChange = (type: string) => async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const shareTypeObject = shareDetails.find((st) => st.type === type);
		setFileSharedState([])
		const aux: ShareState[] = []
		if (selectedSharedFiles) {
			for (const selectedShareFile of selectedSharedFiles) {
				if (!shareTypeObject || !selectedShareFile) {
					setShareError("Invalid share type");
				} else if (selectedShareFile.decrypted === false) {
					setShareError("File is not decrypted yet");
				} else if (shareTypeObject.state === "disabled") {
					setShareError("This share type is not available yet");
				} else {
					setShareError("");
					if (e.target.checked) {
						//handle sharing from shareRequests.ts
						shareFile(selectedShareFile, type)
							.then((res) => {
								//if res is AxiosResponse:
								if ((res as AxiosResponse).status === 200) {
									res = res as AxiosResponse;
									const shareState = res?.data as ShareState;
									aux.push(shareState)
									if (shareState.public_file.id !== 0) {
										setSelectedShareTypes((prevTypes) => [
											...prevTypes,
											"public",
										]);
									}
									toast.success("File shared successfully");
								}
								if ((res as AxiosError).isAxiosError) {
									toast.error("Error sharing file");
								}
							})
							.catch((err) => {
								setShareError(err.message);
							});
					} else {
						unshareFile(selectedShareFile, type)
							.then((res) => {
								//if res is AxiosResponse:
								if ((res as AxiosResponse).status === 200) {
									res = res as AxiosResponse;
									const shareState = res?.data as ShareState;
									aux.push(shareState)
									//if public_file.id is 0, remove public from selectedShareTypes
									if (shareState.public_file.id === 0) {
										setSelectedShareTypes((prevTypes) =>
											prevTypes.filter((st) => st !== "public")
										);
									}
								}
								if ((res as AxiosError).isAxiosError) {
									toast.error("Error unsharing file");
								}
							})
							.catch((err) => {
								setShareError(err.message);
							});
						setSelectedShareTypes((prevTypes) => [...prevTypes, type]);
					}
					setFileSharedState(aux);
				}
			}
		}
	};

	const handleEncryption = async (
		file: File,
		personalSignature: string | undefined,
		isFolder: boolean,
		encryptedPathsMapping: { [path: string]: string }
	): Promise<{
		encryptedFile: File;
		cidOfEncryptedBufferStr: string;
		cidOriginalStr?: string;
		cidOriginalEncryptedBase64Url: string;
		encryptedWebkitRelativePath: string;
		encryptionTime: number;
	} | null> => {
		const fileArrayBuffer = await file.arrayBuffer();

		const encryptedMetadataResult = await encryptMetadata(
			file,
			personalSignature
		);
		if (!encryptedMetadataResult) {
			toast.error("Failed to encrypt metadata");
			return null;
		}
		const {
			encryptedFilename,
			encryptedFiletype,
			fileLastModified,
		} = encryptedMetadataResult;
		const {
			cidOriginalStr,
			cidOfEncryptedBufferStr,
			encryptedFileBuffer,
			encryptionTime,
		} = await encryptFileBuffer(fileArrayBuffer);

		const encryptedFilenameBase64Url = bufferToBase64Url(encryptedFilename);
		const encryptedFiletypeHex = bufferToHex(encryptedFiletype);
		const cidOriginalBuffer = new TextEncoder().encode(cidOriginalStr);
		const cidOriginalEncryptedBuffer = await encryptBuffer(
			cidOriginalBuffer,
			personalSignature
		);

		if (!cidOriginalEncryptedBuffer) {
			toast.error("Failed to encrypt buffer");
			return null;
		}
		const cidOriginalEncryptedBase64Url = bufferToBase64Url(
			cidOriginalEncryptedBuffer
		);
		const encryptedFileBlob = new Blob([encryptedFileBuffer]);
		const encryptedFile = new File(
			[encryptedFileBlob],
			encryptedFilenameBase64Url,
			{ type: encryptedFiletypeHex, lastModified: fileLastModified }
		);

		let encryptedWebkitRelativePath = "";
		if (isFolder) {
			const pathComponents = file.webkitRelativePath.split("/");
			const encryptedPathComponents = [];
			for (const component of pathComponents) {
				// If this component has been encrypted before, use the cached value
				if (encryptedPathsMapping[component]) {
					encryptedPathComponents.push(
						encryptedPathsMapping[component]
					);
				} else {
					const encryptedComponentBuffer = await encryptBuffer(
						new TextEncoder().encode(component),
						personalSignature
					);
					if (!encryptedComponentBuffer) {
						toast.error("Failed to encrypt buffer");
						return null;
					}
					const encryptedComponentHex = bufferToHex(
						encryptedComponentBuffer
					);
					encryptedPathsMapping[component] = encryptedComponentHex;
					encryptedPathComponents.push(encryptedComponentHex);
				}
			}

			// Reconstruct the encrypted webkitRelativePath
			encryptedWebkitRelativePath = encryptedPathComponents.join("/");
		}

		return {
			encryptedFile,
			cidOfEncryptedBufferStr,
			cidOriginalStr,
			cidOriginalEncryptedBase64Url,
			encryptedWebkitRelativePath,
			encryptionTime,
		};
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

		const encryptedPathsMapping: { [path: string]: string } = {};

		let encryptionTimeTotal = 0;

		const filesMap: { customFile: FileType; file: File }[] = [];

		for (let i = 0; i < files.length; i++) {
			let file = files[i];

			if (encryptionEnabled) {
				const originalFile = file;
				const infoText = `Encrypting ${i + 1} of ${files.length}`;
				dispatch(
					setUploadStatusAction({ info: infoText, uploading: true })
				);
				const encryptedResult = await handleEncryption(
					file,
					personalSignature,
					isFolder,
					encryptedPathsMapping
				);
				if (!encryptedResult) {
					toast.error("Failed to encrypt file");
					return;
				}
				const {
					encryptedFile,
					cidOfEncryptedBufferStr,
					cidOriginalStr,
					cidOriginalEncryptedBase64Url,
					encryptedWebkitRelativePath,
					encryptionTime,
				} = encryptedResult;

				file = encryptedFile;

				encryptionTimeTotal += encryptionTime;

				const customFile: FileType = {
					name: encryptedFile.name,
					name_unencrypted: originalFile.name,
					cid: cidOfEncryptedBufferStr || "",
					id: 0,
					uid: "",
					cid_original_encrypted: cidOriginalEncryptedBase64Url || "",
					cid_original_unencrypted: cidOriginalStr || "",
					cid_original_encrypted_base64_url: cidOriginalEncryptedBase64Url,
					size: encryptedFile.size,
					root: root,
					mime_type: encryptedFile.type,
					mime_type_unencrypted: originalFile.type,
					media_type: encryptedFile.type.split("/")[0],
					path: encryptedWebkitRelativePath,
					encryption_status: EncryptionStatus.Encrypted,
					created_at: "",
					updated_at: "",
					deleted_at: "",
				};

				filesMap.push({ customFile, file });
			} else {
				const uint8ArrayBuffer = new Uint8Array(
					await file.arrayBuffer()
				);
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

						fileMap.customFile.name =
							fileMap.customFile.name_unencrypted || "";
						fileMap.customFile.cid_original_encrypted =
							fileMap.customFile.cid_original_unencrypted || "";
						fileMap.customFile.mime_type =
							fileMap.customFile.mime_type_unencrypted || "";

						if (!isFolder)
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
					toast.success("upload Succeed!");
					dispatch(
						setUploadStatusAction({
							info: "Finished uploading data",
							uploading: false,
						})
					);

					//getAll files and encryptedFils into a single files variable from formData
					const filesRes = res.data.files;
					const filesuploaded: FileType[] = []

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
						filesuploaded.push(fileObject)
						if (!isFolder) dispatch(createFileAction(fileObject));
					}
					dispatch(setSelectedSharedFiles(filesuploaded))
				})
				.catch((err) => {
					console.log(err);
					toast.error("upload failed!");
				})
				.finally(() =>
					dispatch(setUploadStatusAction({ uploading: false }))
				);
		} else {
			toast.success("upload Succeed!");
			dispatch(
				setUploadStatusAction({
					info: "Finished uploading data",
					uploading: false,
				})
			);
		}
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
		if (
			modalRef.current &&
			!modalRef.current.contains(event.target as Node)
		) {
			closeShareModal();
		}
	};

	const fileInput = useRef<HTMLInputElement>(null);
	const handleFileUpload = () => {
		fileInput.current?.click();
	};

	const handleFileInputChange: ChangeEventHandler<HTMLInputElement> = (
		event
	) => {
		handleInputChange(event, false);
	};

	useEffect(() => {
		dispatch(setSelectedSharedFiles())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (selectedSharedFiles) {
			setuploaded(true);
		} else {
			setuploaded(false);
		}
	}, [selectedSharedFiles])

	useEffect(() => {
		if (selectedSharedFiles && selectedSharedFiles.length > 0) {
			const uids = selectedSharedFiles.map((file) => file.uid)
			//fetch file shared state
			const params = new URLSearchParams();
			uids.forEach(uid => params.append('file_uids', uid));
			Api.get("/file/share/states", { params })
				.then((res) => {
					//if res is AxiosResponse:
					if ((res as AxiosResponse).status === 200) {
						res = res as AxiosResponse;
						const shareState = res?.data as ShareState[];
						setFileSharedState(shareState);
						if (shareState) {
							for (const shareStatex of shareState) {
								if (shareStatex.public_file.id !== 0) {
									setSelectedShareTypes((prevTypes) => [
										...prevTypes,
										"public",
									]);
								}
							}
						}
						//dispatch(setLoading(false));
						//dispatch(setToastMessage("File shared successfully"));
						//dispatch(setShowToast(true));
					} else {
						//dispatch(setLoading(false));
						toast.error(JSON.stringify(res));
						//dispatch(setShowToast(true));
					}
				})
				.catch((err) => {
					toast.error(err.message);
					//setShareError(err.message);
				});
		}
	}, [selectedSharedFiles]);

	if (!isOpen) {
		return <></>;
	} else {
		return (
			<>
				<div
					className="fixed inset-0 z-10 overflow-y-auto"
					aria-labelledby="modal-title"
					role="dialog"
					aria-modal="true"
				>
					<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
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
							className="lg:ml-[20%] p-5 flex flex-col justify-center align-center align-bottom top-5 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg "
						>
							<div className="flex flex-col items-center justify-center w-full h-full">
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
										<p className="px-2 my-3">Files names:</p>
										<ul>
											{selectedSharedFiles && selectedSharedFiles.map((file) => {
												return <li
													key={file.id}
												>{file.name}</li>;
											})}
										</ul>
										{shareDetails.map((sd, index) => {
											return (
												<div
													className="my-3 col-12 form-check form-switch"
													key={index}
												>
													{/*<input className="form-check-input" type="checkbox" id={`flexSwitch${sd.type}`} checked={selectedShareTypes.includes(sd.type)} onChange={handleShareChange(sd.type)} disabled={sd.state === "disabled"} /> */}
													<label
														className="form-check-label"
														htmlFor={`flexSwitch${sd.type}`}
													>
														<div
															onMouseEnter={() =>
																setShowDescriptionIndex(
																	index
																)
															}
															onMouseLeave={() =>
																setShowDescriptionIndex(
																	null
																)
															}
															className="flex flex-col"
														>
															<div className="flex flex-row items-center">
																<input
																	type="checkbox"
																	className="w-5 h-5 text-blue-600 form-checkbox"
																	checked={selectedShareTypes.includes(
																		sd.type
																	)}
																	onChange={handleShareChange(
																		sd.type
																	)}
																	disabled={
																		sd.state ===
																		"disabled"
																	}
																/>
																<span className="ml-2 text-gray-700">
																	{sd.title}
																</span>
																<span
																	className="ml-2 text-gray-500 cursor-pointer"
																	onClick={() =>
																		pinnedDescriptionIndex ===
																			index
																			? setPinnedDescriptionIndex(
																				null
																			)
																			: setPinnedDescriptionIndex(
																				index
																			)
																	}
																>
																	<i
																		className={`fas fa-thin fa-question-circle p-2 me-2`}
																	></i>
																</span>
															</div>

															{(showDescriptionIndex ===
																index ||
																pinnedDescriptionIndex ===
																index) && (
																	<span
																		id="description"
																		className="flex p-2 ml-2 text-sm bg-gray-200 rounded"
																	>
																		{
																			sd.description
																		}
																	</span>
																)}
														</div>
														{/*
                                                <OverlayTrigger
                                                    key={`tooltip-${index}`}
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip id={`tooltip-${index}`}>
                                                            {sd.description}
                                                        </Tooltip>
                                                    }
                                                >
                                                </OverlayTrigger>
                                                */}
													</label>
													{fileSharedState && fileSharedState.map((fileSharedStatex) => (
														<>
															{sd.type === "public" &&
																fileSharedStatex
																	?.public_file.id !==
																0 && (
																	<div className="flex flex-col my-3">
																		<label
																			htmlFor="shareLink"
																			className="form-label"
																		>
																			Share link
																		</label>
																		<div className="">
																			<input
																				type="email"
																				className="mb-2 underline form-control text-cyan-600 text-ellipsis"
																				id="shareLink"
																				aria-describedby="shareLink"
																				value={`${window.location.origin}/space/shared/public/${fileSharedStatex?.public_file.share_hash}`}
																				onClick={() => {
																					//copy to clipboard
																					navigator.clipboard.writeText(
																						`${window.location.origin}/space/shared/public/${fileSharedStatex?.public_file.share_hash}`
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
																						`/space/shared/public/${fileSharedStatex?.public_file.share_hash}`
																					)
																				}
																			>
																				<i className="fas fa-external-link-alt"></i>{" "}
																				Go
																			</button>
																		</div>
																	</div>
																)}
														</>
													))}

												</div>
											);
										})}
									</>
								) : (
									<>
										<p className="px-2 my-3">Choose the Files you want to share</p>
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

								<div className="px-4 py-3 bg-gray-50 sm:px-6">
									<button
										type="button"
										className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-500 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500sm:text-sm"
										onClick={closeShareModal}
									>
										Close
									</button>
								</div>
							</div>
						</section>
					</div>
				</div>
			</>
		);
	}
};

export default UploadShareModal;
