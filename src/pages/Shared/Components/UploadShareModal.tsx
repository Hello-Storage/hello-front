import { useAuth, useDropdown, useFetchData } from "hooks";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { HiPlus } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "state";
import { Api, ShareState, User } from "api";
import { toast } from "react-toastify";
import { PiShareFatFill } from "react-icons/pi";
import { setUploadStatusAction } from "state/uploadstatus/actions";
import { AxiosError, AxiosProgressEvent, AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { shareFile, unshareFile } from "../Utils/shareUtils";
import { shareDetails } from "./shareDetails";
import { useShareGroup } from "../Utils/useShareGroup";
import { Spinner5 } from "components/Spinner";
import { FaPlusCircle } from "react-icons/fa";
import { isValidEmail } from "utils/validations";
import { Theme } from "state/user/reducer";
import { ListUserElement } from "./UserListElement";
import { filesUpload } from "utils/upload/filesUpload";
import { FilesUpload } from "api/types/upload";

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
	const thisEncryptionEnabledRef = useRef(encryptionEnabled);
	const thisAutoEncryptionEnabledRef = useRef(autoEncryptionEnabled);
	const [Procesing, setProcesing] = useState(false);
	const { fetchUserDetail } = useFetchData();
	const { name } = useAppSelector((state) => state.user);

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

	useEffect(() => {
		thisEncryptionEnabledRef.current = encryptionEnabled;
		thisAutoEncryptionEnabledRef.current = autoEncryptionEnabled;
	}, [autoEncryptionEnabled, encryptionEnabled])

	const handleInputChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
		isFolder: boolean
	) => {
		setProcesing(true);
		toast.info("Uploading...");
		const root = "/";
		const files = event.target.files;

		if (!files) return;

		const encapsulatedFile: FilesUpload = {
			files,
			isFolder,
			root,
			encryptionEnabled: thisEncryptionEnabledRef.current,
			name,
			logout,
			dispatch,
			onUploadProgress,
			fetchUserDetail,
		}

		filesUpload(encapsulatedFile).then(() => {
			fetchUserDetail();
		})

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
		setProcesing(false);
		setreadyToshare(false);
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
			// create share state for selected files (the true parameter is to create shared state for all selected files if not exists)
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
			toast.info("Sharing in progress...");
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
								const resp = res as AxiosResponse;
								if (resp.status === 200) {
									//if user.email includes @m and selectedShareTypes is email, then it is an email
									if (user.email.includes("@")) {
										toast.success("Email sent to " + user.email + " successfully");
									} else {
										toast.success("File shared successfully to " + user.email);
									}
								} else {
									const err = res as AxiosError;
									setShareError(err.message);
									toast.error("Could not share to user: " + user.email);
								}
							}).catch((err) => {
								setShareError(err.message);
								toast.error("Could not share to user: " + user.email);
							})
					}
				}
			}
			setreadyToshare(false);
			//closeShareModal();
		}
	}, [readyToshare]);

	const groupID = useShareGroup(fileSharedState, selectedShareTypes);

	const { theme } = useAppSelector((state) => state.user);

	if (!isOpen) {
		return <></>;
	} else {
		return (
			<dialog
				open={isOpen}
				className="fixed inset-0 z-10"
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
			</dialog>
		);
	}
};

export default UploadShareModal;
