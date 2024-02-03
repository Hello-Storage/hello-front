/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { AxiosError, AxiosResponse } from "axios";
import { shareDetails } from "./shareDetails";
import {
	setSelectedShareFile,
	setShowShareModal,
} from "state/mystorage/actions";
import { useAppSelector } from "state";
import { toast } from "react-toastify";
import { shareFile, unshareFile } from "../Utils/shareUtils";
import { useNavigate } from "react-router-dom";
import { isValidEmail } from "utils/validations";
import { FaPlusCircle } from "react-icons/fa";
import { PiShareFatFill } from "react-icons/pi";
import { Theme } from "state/user/reducer";
import { ListUserElement } from "./UserListElement";

const ShareModal = () => {
	const [fileSharedState, setFileSharedState] = useState<ShareState>();
	const [pinnedDescriptionIndex, setPinnedDescriptionIndex] = useState<
		number | null
	>(null);
	const [selectedShareTypes, setSelectedShareTypes] = useState<string>("");

	const modalRef = useRef<HTMLDivElement>(null);

	const dispatch = useDispatch();

	const { showShareModal, selectedShareFile } = useAppSelector(
		(state) => state.mystorage
	);

	const [user, setuser] = useState<string | undefined>(undefined);
	const [userList, setuserList] = useState<User[]>([]);
	const [readyToshare, setreadyToshare] = useState<boolean>(false);

	const [shareError, setShareError] = useState("");

	const closeShareModal = () => {
		dispatch(setSelectedShareFile(undefined));
		dispatch(setShowShareModal(!showShareModal));
	};

	const handleShareChange = (type: string) => async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const shareTypeObject = shareDetails.find((st) => st.type === type);
		setShareError("");
		if (selectedShareFile) {
			if (!shareTypeObject) {
				setShareError("Invalid share type");
			} else if (shareTypeObject.state === "disabled") {
				setShareError("This share type is not available yet");
			} else if (["wallet", "email"].includes(type)) {
				setSelectedShareTypes(type);
			} else {
				setSelectedShareTypes(type);
				if (e.target.checked) {
					// Handle sharing from shareRequests.ts
					shareFile(selectedShareFile, type, user)
						.then((res) => {
							res = res as AxiosResponse;
							if (res.status === 200) {
								const shareState = res?.data as ShareState;
								setFileSharedState(shareState);
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
								const shareState = res?.data as ShareState;
								setFileSharedState(shareState);
							}
						})
						.catch((err) => {
							setShareError(err.message);
						});
				}
			}
		}
		setuserList([]);
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

	const navigate = useNavigate();

	useEffect(() => {
		if (readyToshare) {
			if (userList.length > 0 && selectedShareFile) {
				for (const user of userList) {
					shareFile(selectedShareFile, selectedShareTypes, user.email)
						.then((res) => {
							const resp = res as AxiosResponse;
							if (resp.status === 200) {
								toast.success("File shared successfully");
							} else {
								const err = res as AxiosError;
								setShareError(err.message);
								toast.error("Could not be shared to user: " + user.email);
							}
						})
				}
			}
			setreadyToshare(false);
			closeShareModal();
		}
	}, [readyToshare]);

	const { theme } = useAppSelector((state) => state.user);

	return (
		<>
			{showShareModal && selectedShareFile && (
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
												File name:{" "}
												{selectedShareFile.name}
											</p>
											{selectedShareTypes !== "" && (
												<>
													{[
														"public",
														"one-time",
														"monthly",
														"email",
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
																		+ (theme === Theme.DARK ? " dark-theme3" : " ")} id="shareLink"
																	aria-describedby="shareLink"
																	value={`${window.location.origin}/space/shared/public/${fileSharedState?.public_file.share_hash}`}
																	onClick={() => {
																		//copy to clipboard
																		navigator.clipboard.writeText(
																			`${window.location.origin}/space/shared/public/${fileSharedState?.public_file.share_hash}`
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
																			`/space/shared/public/${fileSharedState?.public_file.share_hash}`
																		)
																	}
																>
																	<i className="fas fa-external-link-alt"></i>{" "}
																	Go
																</button>
															</div>
														</div>
													) : (

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

export default ShareModal;
