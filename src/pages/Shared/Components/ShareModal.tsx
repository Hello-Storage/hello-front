/* eslint-disable react-hooks/exhaustive-deps */
import { useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { AxiosResponse } from "axios";
import { Api, EncryptionStatus } from "api";
import { shareDetails as OShareDetail } from "./shareDetails";
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

	const hasRun = useRef(false);
	const [shareDetails, setShareDetails] = useState<ShareDetails[]>([]);

	useEffect(() => {
		if (
			selectedShareFile &&
			selectedShareFile.encryption_status === EncryptionStatus.Public
		) {
			setShareDetails([...OShareDetail]);
		} else {
			setShareDetails(
				OShareDetail.filter(
					(shareDetail) =>
						!["wallet", "email"].includes(shareDetail.type)
				)
			);
		}

		if (!hasRun.current && selectedShareFile) {
			hasRun.current = true;
			//fetch file shared state
			Api.get<ShareState>("/file/share/state", {
				params: {
					file_uid: selectedShareFile.uid,
				},
			})
				.then((res) => {
					//if res is AxiosResponse:
					if ((res as AxiosResponse).status === 200) {
						res = res as AxiosResponse;
						const shareState = res?.data as ShareState;
						setFileSharedState(shareState);
						if (shareState.public_file.id !== 0) {
							setSelectedShareTypes("public");
						}
					} else {
						toast.error(JSON.stringify(res));
					}
				})
				.catch((err) => {
					toast.error(err.message);
				});
		}
	}, [selectedShareFile]);

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
			toast.error("Invalid Email.");
			return false;
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
			setreadyToshare(false);
			closeShareModal();
		}
	}, [readyToshare]);

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
							className="ml-[10%] flex flex-col justify-center align-center align-bottom top-5 bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg "
						>
							<div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
								<div className="sm:flex sm:items-start">
									<div className="mt-3 text-left sm:mt-0 sm:text-left">
										<h3
											className="text-lg font-medium leading-6 text-gray-900"
											id="modal-title"
										>
											Share content
										</h3>
										<div className="mt-2">
											<p className="mb-3">
												File name:{" "}
												{selectedShareFile.name}
											</p>
											<p
												className={
													selectedShareFile.encryption_status ===
													EncryptionStatus.Encrypted
														? "mb-3 text-xs"
														: "hidden"
												}
											>
												{selectedShareFile.encryption_status ===
												EncryptionStatus.Encrypted
													? "Only public files can be shared via email and wallet."
													: ""}
											</p>
											{selectedShareTypes !== "" && (
												<>
													{[
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
																	type="email"
																	className="mb-2 underline form-control text-cyan-600 text-ellipsis"
																	id="shareLink"
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
															<div className="flex flex-row flex-wrap w-full">
																{userList.map(
																	(
																		user,
																		index
																	) => (
																		<div
																			key={
																				index
																			}
																			className="px-2 py-1 m-1 transition-transform transform rounded-full cursor-pointer hover:scale-110"
																			style={{
																				background:
																					user.color,
																				color:
																					"white",
																			}}
																			onClick={() =>
																				handleRemoveEmail(
																					index
																				)
																			}
																		>
																			{
																				user.email
																			}
																		</div>
																	)
																)}
															</div>
															<div className="flex flex-row items-center justify-center">
																<input
																	id="user"
																	type="email"
																	className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:border-gray-400 focus:outline-none block w-full px-2.5 py-2"
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
																			e
																				.target
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
																		size={
																			35
																		}
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
																	<span className="ml-2 text-gray-700">
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
																		className="flex p-2 ml-2 text-sm bg-gray-200 rounded"
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
							<div className="px-4 py-3 bg-gray-50 sm:px-6">
								<button
									type="button"
									className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-500 border border-transparent rounded-md shadow-sm sm:w-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:text-sm"
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
