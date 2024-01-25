
/* eslint-disable react-hooks/exhaustive-deps */
import { useDropdown } from "hooks";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "state";
import { toast } from "react-toastify";
import { PiShareFatFill } from "react-icons/pi";
import {
	setSelectedShareFolder,
	setSelectedSharedFiles,
	setShowShareModal
} from "state/mystorage/actions";
import { AxiosResponse } from "axios";
import { useNavigate } from "react-router-dom";
import { shareFolder } from "../Utils/shareUtils";
import { FaPlusCircle } from "react-icons/fa";
import { isValidEmail } from "utils/validations";
import { Theme } from "state/user/reducer";
import useGetFolderFiles from "../Utils/useGetFolderFiles";
import { FolderContentClass } from "../Utils/types";
import { shareDetails } from "./shareDetails";
import { ListUserElement } from "./UserListElement";


export function ShareFolderModal() {

	const { showShareModal, selectedShareFolder } = useAppSelector(
		(state) => state.mystorage
	);
	const [selectedSharedFiles, setselectedSharedFiles] = useState<FolderContentClass>(new FolderContentClass())
	const dropRef = useRef<HTMLDivElement>(null);
	const interval = useRef<NodeJS.Timer>()
	const [open, setOpen] = useState(false);
	const [privateUserAvailable, setprivateUserAvailable] = useState(true);
	useDropdown(dropRef, open, setOpen);
	const dispatch = useAppDispatch();
	const [pinnedDescriptionIndex, setPinnedDescriptionIndex] = useState<
		number | null
	>(null);

	const [user, setuser] = useState<string>("");
	const [userList, setuserList] = useState<User[]>([]);
	const [readyToshare, setreadyToshare] = useState<boolean>(false);
	const modalRef = useRef<HTMLDivElement>(null);

	const navigate = useNavigate();
	const [shareError, setShareError] = useState("");
	const [selectedShareTypes, setSelectedShareTypes] = useState<string>("");

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
				if (e.target.checked) {
					toast.info("Sharing in progress");
					// Handle sharing from shareRequests.ts
					shareFolder(selectedSharedFiles, type, user)
						.then(() => {
							toast.success("Folder shared successfully");
						})
						.catch((err) => {
							setShareError(err.message);
						});
				} else {
					// TODO: Handle unsharing
					// setSelectedShareTypes("");
					// unshareFolder(selectedSharedFiles, type)
					// 	.then((res) => {
					// 		res = res as AxiosResponse;
					// 		if (res.status === 200) {
					// 			toast.info("Successfully unshared");
					// 		}
					// 	})
					// 	.catch((err) => {
					// 		setShareError(err.message);
					// 	});
				}

			}
		}
		setuserList([]);
	};

	const closeShareModal = () => {
		dispatch(setSelectedSharedFiles());
		dispatch(setSelectedShareFolder());
		dispatch(setShowShareModal(!showShareModal));
		clearInterval(interval.current)
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

	useEffect(() => {
		dispatch(setSelectedSharedFiles());
		setreadyToshare(false);
		clearInterval(interval.current)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

		function ShareToUser(folder: FolderContentClass, user: User) {
			if (
				folder
			) {
				shareFolder(
					folder,
					selectedShareTypes,
					user.email
				)
					.then((res) => {
						res = res as AxiosResponse;
						if (res.status === 200) {
							toast.success("Folder shared successfully to user " + user.email);
						}
					})
					.catch((err) => {
						setShareError(err.message);
					});
			}
		}
		if (readyToshare) {
			if (userList.length > 0 && selectedSharedFiles?.files) {
				for (const user of userList) {
					ShareToUser(selectedSharedFiles, user)
				}
			}
			setreadyToshare(false);
			closeShareModal();
		}
	}, [readyToshare]);

	const [loading, setLoading] = useState(true);
	let { folderContent } = selectedShareFolder ? useGetFolderFiles(selectedShareFolder) : { folderContent: null };

	useEffect(() => {
		interval.current = setInterval(() => {
			if (folderContent && folderContent.current) {
				setselectedSharedFiles(folderContent.current);
				setLoading(false);
			}
		}, 500);

	}, [folderContent?.current]);

	const { theme } = useAppSelector((state) => state.user);

	return (
		<>
			{showShareModal && selectedShareFolder && (
				<div
					className="fixed inset-0 z-10 overflow-y-auto"
					aria-labelledby="modal-title"
					role="dialog"
					aria-modal="true"
				>
					<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
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

						<div
							ref={modalRef}
							className={"ml-[10%] flex flex-col justify-center align-center align-bottom top-5 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg "
								+ (theme === Theme.DARK ? " dark-theme" : " bg-white")}
						>
							<div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-left sm:mt-0 sm:text-left">
										<h3
											className={"text-lg font-medium leading-6 "
												+ (theme === Theme.DARK ? " text-gray-200" : " text-gray-900")}
											id="modal-title"
										>
											Share content
										</h3>
										<div className="mt-2">
											<p className="mb-3">
												Folder name:{" "}
												{selectedShareFolder.title}
											</p>
											<p className="mb-3">
												Elements:{" "}
												{loading ? "loading..." : ((selectedSharedFiles.files.length + selectedSharedFiles.folders.length))}
											</p>
											<p
												className={
													((selectedSharedFiles.files.length + selectedSharedFiles.folders.length) === 0)
														? "mb-3 text-xs"
														: "hidden"
												}
											>
												Folder is Empty.
											</p>
											<p
												className={
													(!privateUserAvailable)
														? "mb-3 text-xs"
														: "hidden"
												}
											>
												The folder cannot be shared with users because it contains encrypted files.
											</p>
											{selectedShareTypes !== "" && (
												<>
													{[
														"public",
														"one-time",
														"monthly",
													].includes(
														selectedShareTypes
													) &&
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
																	value={`${window.location.origin}/space/shared/folder/${selectedShareFolder.uid}`}
																	onClick={() => {
																		//copy to clipboard
																		navigator.clipboard.writeText(
																			`${window.location.origin}/space/shared/folder/${selectedShareFolder.uid}`
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
																			`/space/shared/folder/${selectedShareFolder.uid}`
																		)
																	}
																>
																	<i className="fas fa-external-link-alt"></i>{" "}
																	Go
																</button>
															</div>
														</div>
													}
													{
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
															<div className="flex flex-row flex-wrap w-full">
																{userList.map(
																	(
																		user,
																		index
																	) => (
																		<ListUserElement
																			user={user}
																			handleRemoveEmail={handleRemoveEmail}
																			index={index}
																			key={user.email}
																		></ListUserElement>
																	)
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
													}
												</>
											)}
											{!loading && (selectedSharedFiles.files.length + selectedSharedFiles.folders.length) > 0 && shareDetails.map((sd, index) => {
												return (
													<div
														className="col-12 form-check form-switch"
														key={index}
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
																	<span className={"ml-2 "
																		+ (theme === Theme.DARK ? " text-white" : " text-gray-700")}>
																		{
																			sd.title
																		}
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
																		<i className="p-2 fas fa-thin fa-question-circle me-2"></i>
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
										</div>
									</div>
								</div>
							</div>

							{shareError && (
								<div
									className="alert alert-danger"
									role="alert"
								>
									{shareError}
								</div>
							)}
							<div className="px-4 py-3 sm:px-6">
								<button
									type="button"
									className={"text-blue-700 border border-gray-300 bg-transparent focus:outline-none rounded-full text-sm px-5 py-2.5 text-center"
										+ (theme === Theme.DARK ? " dark-theme3" : " hover:bg-gray-200")}
									onClick={closeShareModal}
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ShareFolderModal;
